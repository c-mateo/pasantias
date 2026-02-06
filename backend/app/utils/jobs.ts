// Lightweight enqueue helper: prefer Queue when available, fallback to local execution
export async function enqueue(jobName: string, payload: any) {
  try {
    // Try to resolve Adonis Queue via IoC and dispatch if available.
    const bindings = ['@ioc:Adonis/Addons/Queue', 'adonisjs-jobs/queue']
    for (const binding of bindings) {
      try {
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

  // Fallback: require `#jobs/<jobName>` and run its `handle` method synchronously
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
