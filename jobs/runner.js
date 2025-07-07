const cds = require('@sap/cds')

/**
 * Simple job scheduler for CoffeeX backend
 * Runs BatchPay every hour and Forecast daily at 3 AM CEST
 */
class JobRunner {
  constructor() {
    this.jobs = new Map()
    this.running = false
  }
  
  async init() {
    console.log('Initializing job scheduler...')
    
    // Connect to database
    this.db = await cds.connect.to('db')
    
    // Initialize jobs in database if not exist
    await this.initializeJobs()
    
    // Start the scheduler
    this.start()
  }
  
  async initializeJobs() {
    const existingJobs = await SELECT.from('coffeex.jobs.SchedulerJobs')
    
    const defaultJobs = [
      {
        job: 'BatchPay',
        handler: 'CoffeeService.BatchPay',
        intervalMs: 60 * 60 * 1000, // 1 hour
        nextRun: this.getNextHourlyRun()
      },
      {
        job: 'Forecast',
        handler: 'CoffeeService.Forecast',
        intervalMs: 24 * 60 * 60 * 1000, // 24 hours
        nextRun: this.getNext3AMRun()
      },
      {
        job: 'CheckLowBalances',
        handler: 'CoffeeService.CheckLowBalances',
        intervalMs: 4 * 60 * 60 * 1000, // 4 hours
        nextRun: this.getNextHourlyRun()
      }
    ]
    
    for (const job of defaultJobs) {
      const exists = existingJobs.find(j => j.job === job.job)
      if (!exists) {
        await INSERT.into('coffeex.jobs.SchedulerJobs').entries(job)
        console.log(`Initialized job: ${job.job}`)
      }
    }
  }
  
  getNextHourlyRun() {
    const now = new Date()
    const next = new Date(now)
    next.setHours(next.getHours() + 1, 0, 0, 0)
    return next
  }
  
  getNext3AMRun() {
    const now = new Date()
    const next = new Date(now)
    
    // Set to 3 AM CEST (which is 1 AM UTC)
    next.setUTCHours(1, 0, 0, 0)
    
    // If it's already past 3 AM today, schedule for tomorrow
    if (next <= now) {
      next.setDate(next.getDate() + 1)
    }
    
    return next
  }
  
  async start() {
    if (this.running) return
    
    this.running = true
    console.log('Job scheduler started')
    
    // Check for jobs every minute
    this.interval = setInterval(async () => {
      await this.checkAndRunJobs()
    }, 60000) // 1 minute
    
    // Run initial check
    await this.checkAndRunJobs()
  }
  
  async stop() {
    if (this.interval) {
      clearInterval(this.interval)
      this.interval = null
    }
    this.running = false
    console.log('Job scheduler stopped')
  }
  
  async checkAndRunJobs() {
    try {
      const now = new Date()
      
      // Get jobs that need to run
      const jobs = await SELECT.from('coffeex.jobs.SchedulerJobs')
        .where`nextRun <= ${now} and enabled = true`
      
      for (const job of jobs) {
        // Skip if job is already running
        if (job.lastStatus === 'RUNNING') {
          console.log(`Job ${job.job} is already running, skipping...`)
          continue
        }
        
        // Run the job
        await this.runJob(job)
      }
    } catch (error) {
      console.error('Error checking jobs:', error)
    }
  }
  
  async runJob(job) {
    console.log(`Starting job: ${job.job}`)
    
    try {
      // Mark job as running
      await UPDATE('coffeex.jobs.SchedulerJobs')
        .set({ lastStatus: 'RUNNING', lastRun: new Date() })
        .where({ job: job.job })
      
      // Connect to the service
      const srv = await cds.connect.to('CoffeeService')
      
      // Execute the handler
      const [service, action] = job.handler.split('.')
      let result
      
      switch (action) {
        case 'BatchPay':
          result = await srv.send('BatchPay')
          console.log(`BatchPay processed ${result} transactions`)
          break
          
        case 'Forecast':
          result = await srv.send('Forecast')
          console.log(`Forecast updated ${result} machines`)
          break
          
        case 'CheckLowBalances':
          result = await srv.send('CheckLowBalances')
          console.log(`CheckLowBalances notified ${result} users`)
          break
          
        default:
          throw new Error(`Unknown handler: ${job.handler}`)
      }
      
      // Update job status and schedule next run
      const nextRun = new Date(Date.now() + job.intervalMs)
      await UPDATE('coffeex.jobs.SchedulerJobs')
        .set({ 
          lastStatus: 'SUCCESS', 
          nextRun: nextRun 
        })
        .where({ job: job.job })
      
      console.log(`Job ${job.job} completed successfully. Next run: ${nextRun}`)
      
    } catch (error) {
      console.error(`Job ${job.job} failed:`, error)
      
      // Mark job as failed
      await UPDATE('coffeex.jobs.SchedulerJobs')
        .set({ lastStatus: 'FAILED' })
        .where({ job: job.job })
      
      // Still schedule next run
      const nextRun = new Date(Date.now() + job.intervalMs)
      await UPDATE('coffeex.jobs.SchedulerJobs')
        .set({ nextRun: nextRun })
        .where({ job: job.job })
    }
  }
}

// Create and export singleton instance
const jobRunner = new JobRunner()

// Initialize when CDS is ready
cds.on('served', async () => {
  try {
    await jobRunner.init()
  } catch (error) {
    console.error('Failed to initialize job runner:', error)
  }
})

// Cleanup on shutdown
process.on('SIGTERM', () => {
  jobRunner.stop()
})

module.exports = jobRunner 