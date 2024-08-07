<template>
  <div class="Workers">
    <BaseHeadline
      :route="backbutton"
      :title="title"
      :description="`Started: ${date}`"
      :meta="`HIT: ${id}`"
    />
    <BaseWrapper title="Workers waiting for approval" gray-dark>
      <TableSubmitted
        :workers="submitted"
        @onApprove="handleApprove"
        @onReject="handleReject"
        @onQualify="handleQualify"
      />
    </BaseWrapper>
    <BaseWrapper title="Workers approved" green>
      <TableApproved :workers="approved" />
    </BaseWrapper>
    <BaseWrapper title="Workers rejected" red>
      <TableRejected :workers="rejected" />
    </BaseWrapper>
    <BaseButton prime title="refresh" @click="refreshPage" />
    <BaseButton second title="Qualify All" @click="handleQualifyAll" />

    <BaseModal
      :visible="modalApproveIsVisible"
      title="Approve Assignment"
      :cancel="{ label: 'cancel' }"
      :accept="{ label: 'approve', type: 'success' }"
      @onAccept="approveAssignment"
      @onCancel="closeModal"
    >
      <p>Leave feedback for the worker if you like</p>
      <BaseTextarea
        label="Feedback"
        :value="approvalFeedback"
        @keyPress="setApprovalFeedback"
      />
    </BaseModal>

    <BaseModal
      :visible="modalRejectIsVisible"
      title="Reject Assignment"
      :cancel="{ label: 'cancel' }"
      :accept="{ label: 'reject', type: 'warning' }"
      @onAccept="rejectAssignment"
      @onCancel="closeModal"
    >
      <p>Leave feedback for the worker</p>
      <BaseTextarea
        label="Feedback"
        :value="rejectFeedback"
        @keyPress="setRejectionFeedback"
      />
    </BaseModal>
  </div>
</template>
<script>
import BaseButton from '@/components/BaseButton.vue'
import BaseHeadline from '@/components/BaseHeadline.vue'
import BaseModal from '@/components/BaseModal.vue'
import BaseTextarea from '@/components/BaseTextarea.vue'
import BaseWrapper from '@/components/BaseWrapper.vue'

import TableApproved from '@/components/workers/Table-Approved.vue'
import TableRejected from '@/components/workers/Table-Rejected.vue'
import TableSubmitted from '@/components/workers/Table-Submitted.vue'
import api from '@/api'

var moment = require('moment')

export default {
  name: 'Tags',
  components: {
    BaseButton,
    BaseModal,
    BaseHeadline,
    BaseTextarea,
    BaseWrapper,
    TableApproved,
    TableRejected,
    TableSubmitted,
  },
  props: {
  },
  data: () => ({
    id: '',
    title: '',
    creationTime: '',
    awardQualificationID: '',
    modalRejectIsVisible: false,
    modalApproveIsVisible: false,
    rejectFeedback:
      'Worker did not submit any data, our server shows no HIT-relevant activity whatsoever for this assigment.',
    approvalFeedback: 'Thank you very much for participating!',
    assignmentID: '',
    workerID: '',
    backbutton: {
      paths: 'overview',
      name: 'back to Overview',
    },
    submitted: null,
    approved: null,
    rejected: null,
  }),
  computed: {
    date: {
      get() {
        return moment(this.creationTime).format('DD.MM.YYYY - HH:mm:ss')
      },
      set() {},
    },
  },
  mounted: async function() {
    this.awardQualificationID = this.$route.query.awardQualificationID || ''
    console.log("Stored QualifivationID: " + this.awardQualificationID);
    await this.getWorkers()
    this.getHIT()
  },
  methods: {
    async getHIT() {
      let id = this.$route.query.id || ''
      let res = await api.getHIT({ id })

      if (res.success) {
        let hit = res.data
        this.id = hit.HITId
        this.title = hit.Title
        this.creationTime = hit.creationTime
      } else {
        this.$toasted.show(res.message, {
          type: 'error',
          position: 'bottom-right',
          duration: 3000,
        })
      }
    },
    clearWorkers() {
      this.submitted = []
      this.approved = []
      this.rejected = []
    },
    async getWorkers() {
      let id = this.$route.query.id || ''

      let res = await api.listAssignments({ id })
      this.clearWorkers()

      console.log(res)

      if (res.success) {
        let assignments = res.data
        for (let assignment of assignments) {
          let id = assignment.WorkerId
          let assignmentID = assignment.AssignmentId
          let startTime = moment(assignment.AcceptTime).format('HH:mm:ss')
          let startDate = moment(assignment.AcceptTime).format('DD.MM.YYYY')
          let finishTime = moment(assignment.SubmitTime).format('HH:mm:ss')
          let finishDate = moment(assignment.SubmitTime).format('DD.MM.YYYY')
          let status = assignment.AssignmentStatus.toLowerCase()

          let worker = {
            id: id,
            assignmentID: assignmentID,
            started: {
              time: startTime,
              date: startDate,
            },
            finished: {
              time: finishTime,
              date: finishDate,
            },
          }

          if (status === 'rejected') {
            let rejectionTime = moment(assignment.RejectionTime).format(
              'HH:mm:ss'
            )
            let rejectionDate = moment(assignment.RejectionTime).format(
              'DD.MM.YYYY'
            )
            worker.rejected = {
              time: rejectionTime,
              date: rejectionDate,
            }
          } else if (status === 'approved') {
            let approvedTime = moment(assignment.ApprovalTime).format(
              'HH:mm:ss'
            )
            let approvedDate = moment(assignment.ApprovalTime).format(
              'DD.MM.YYYY'
            )
            worker.approved = {
              time: approvedTime,
              date: approvedDate,
            }
          }
          this[status].push(worker)
        }
      }
      console.log(this.submitted)
      console.log(this.approved)
      console.log(this.rejected)
    },
    handleApprove({ workerID, assignmentID }) {
      this.modalApproveIsVisible = true
      this.workerID = workerID
      this.assignmentID = assignmentID
    },
    handleReject(id) {
      this.modalRejectIsVisible = true
      this.assignmentID = id
    },
    handleQualify(workerID) {
      this.qualifyWorker(workerID);
    },
    handleQualifyAll() {
      //console.log("Qualifying submitted Workers: ")
      for (let worker of this.submitted) {
        //console.log("Asking for Qualifying Worker " + worker.id + " with Qualification " + this.awardQualificationID);
        this.qualifyWorker(worker.id);
      }

      //console.log("Qualifying approved Workers: ")
      for (let worker of this.approved) {
        //console.log("Asking for Qualifying Worker " + worker.id + " with Qualification " + this.awardQualificationID);
        this.qualifyWorker(worker.id);
      }

      console.log("Qualifying rejected Workers: ")
      for (let worker of this.rejected) {
        console.log("Asking for Qualifying Worker " + worker.id + " with Qualification " + this.awardQualificationID);
        this.qualifyWorker(worker.id);
      }
    },
    async qualifyWorker(workerID) {
      //this.modalRejectIsVisible = true
      this.workerID = workerID
      let awardQualificationID = this.awardQualificationID || ''
      console.log("Qualifying Worker " + workerID + " with Qualification " + awardQualificationID);

      let res = await api.qualifyWorker({ awardQualificationID, workerID })

      if (res.success) {
        //await this.getWorkers()
        console.log("Qualified " + workerID);
        this.$toasted.show(res.message, {
          type: 'success',
          position: 'bottom-right',
          duration: 3000,
        })
      } else {
        this.$toasted.show(res.message, {
          type: 'error',
          position: 'bottom-right',
          duration: 3000,
        })
      }
    },
    closeModal() {
      this.feedback = ''
      this.assignmentID = ''
      this.modalApproveIsVisible = false
      this.modalRejectIsVisible = false
    },
    async approveAssignment() {
      let id = this.assignmentID
      let feedback = this.approvalFeedback
      let awardQualificationID = this.awardQualificationID || ''
      let workerID = this.workerID

      let res = await api.approveAssignment({
        id,
        feedback,
        awardQualificationID,
        workerID,
      })

      if (res.success) {
        this.closeModal()
        await this.getWorkers()

        this.$toasted.show(res.message, {
          type: 'success',
          position: 'bottom-right',
          duration: 3000,
        })
      } else {
        this.$toasted.show(res.message, {
          type: 'error',
          position: 'bottom-right',
          duration: 3000,
        })
      }
    },
    async rejectAssignment() {
      let id = this.assignmentID
      let feedback = this.rejectFeedback
      console.log(feedback)
      let res = await api.rejectAssignment({ id, feedback })
      if (res.success) {
        this.closeModal()
        await this.getWorkers()

        this.$toasted.show(res.message, {
          type: 'error',
          position: 'bottom-right',
          duration: 3000,
        })
      } else {
        this.$toasted.show(res.message, {
          type: 'error',
          position: 'bottom-right',
          duration: 3000,
        })
      }
    },
    setApprovalFeedback(val) {
      this.approvalFeedback = val.feedback
    },
    setRejectionFeedback(val) {
      this.rejectFeedback = val.feedback
    },
    async refreshPage() {
      this.submitted = null
      this.approved = null
      this.rejected = null

      await this.getWorkers()
    },
  },
}
</script>
<style lang="scss">
.Workers {
  position: relative;

  > .BaseButton.is-prime {
    position: absolute;
    top: 0;
    right: 0;
  }
  > .BaseButton.is-second {
    position: absolute;
    right: 0;
  }
}
</style>
