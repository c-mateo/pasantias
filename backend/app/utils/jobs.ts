// Lightweight jobs enqueue wrapper: tries to use Adonis Queue when available,
// otherwise falls back to immediate execution of the job handler. This makes
// code work in environments without a running queue during development.

export async function enqueue(jobName: string, payload: any) {
  try {
    // Try to resolve Adonis Queue via IoC. If present, dispatch the job.
    // Using dynamic import to avoid hard dependency at module load time.
    // The IoC binding for adonisjs-jobs is usually '@ioc:Adonis/Addons/Queue'.
    // Try several common bindings for compatibility.
    const bindings = ['@ioc:Adonis/Addons/Queue', 'adonisjs-jobs/queue']
    for (const binding of bindings) {
      try {
        // eslint-disable-next-line @typescript-eslint/no-var-requires
        const Queue = require(binding)
        if (Queue && typeof Queue.dispatch === 'function') {
          return Queue.dispatch(jobName, payload)
        }
        if (Queue && Queue.default && typeof Queue.default.dispatch === 'function') {
          return Queue.default.dispatch(jobName, payload)
        }
      } catch (e) {
        // try next binding
      }
    }
  } catch (err) {
    // fallthrough to local execution
  }

  // Fallback: attempt to require the job module from `#jobs/<jobName>` and
  // execute its `handle` method directly. This allows jobs to run synchronously
  // when no queue worker is available (useful for local dev or tests).
  try {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const jobModule = require(`#jobs/${jobName}`)
    const Job = jobModule.default || jobModule
    if (typeof Job === 'function') {
      const instance = new Job()
      if (typeof instance.handle === 'function') return instance.handle(payload)
    }
    if (typeof Job.handle === 'function') return Job.handle(payload)
  } catch (err) {
    // If module not found or execution failed, surface a useful error.
    console.error('Failed to enqueue job', jobName, err)
    throw err
  }
}

export default { enqueue }
