const { SQSClient, ReceiveMessageCommand, DeleteMessageCommand, SendMessageCommand } = require('@aws-sdk/client-sqs');

class ScalewaySQSAdapter {
  constructor() {
    const config = {
      endpoint: process.env.SCALEWAY_SQS_ENDPOINT || 'https://sqs.mnq.fr-par.scaleway.com',
      region: 'fr-par',
      credentials: {
        accessKeyId: process.env.SCALEWAY_ACCESS_KEY || 'It4rjFC3VR8c2MfRl1zz',
        secretAccessKey: process.env.SCALEWAY_SECRET_KEY || 'A7ym6TJlxTOFyvw8I45L4mNknf6NW252AAw3vX1JaKqNzuvrc5VBowWffLjaPLtb'
      }
    };
    
    this.client = new SQSClient(config);
    this.queueUrl = process.env.SCALEWAY_QUEUE_URL || 'https://sqs.mnq.fr-par.scaleway.com/project-e9c9a739-08cc-40e1-849b-91d54e62c795/ucc-tum-coffee';
    this.pollingInterval = process.env.SQS_POLLING_INTERVAL || 20000; // 20 seconds
    this.handlers = new Map();
    this.isPolling = false;
  }

  // Register event handler
  on(event, handler) {
    if (!this.handlers.has(event)) {
      this.handlers.set(event, []);
    }
    this.handlers.get(event).push(handler);
    
    // Start polling if not already started
    if (!this.isPolling) {
      this.startPolling();
    }
  }

  // Emit event (send message to queue)
  async emit(event, data) {
    try {
      const message = {
        event,
        data,
        timestamp: new Date().toISOString()
      };

      const command = new SendMessageCommand({
        QueueUrl: this.queueUrl,
        MessageBody: JSON.stringify(message)
      });

      await this.client.send(command);
      console.log(`[Scaleway SQS] Sent ${event} event to queue`);
    } catch (error) {
      console.error(`[Scaleway SQS] Failed to send message:`, error);
      throw error;
    }
  }

  // Start polling for messages
  startPolling() {
    this.isPolling = true;
    this.poll();
  }

  // Poll for messages
  async poll() {
    while (this.isPolling) {
      try {
        const command = new ReceiveMessageCommand({
          QueueUrl: this.queueUrl,
          MaxNumberOfMessages: 10,
          WaitTimeSeconds: 20, // Long polling
          VisibilityTimeout: 30
        });

        const response = await this.client.send(command);
        
        if (response.Messages && response.Messages.length > 0) {
          for (const message of response.Messages) {
            await this.processMessage(message);
          }
        }
      } catch (error) {
        console.error('[Scaleway SQS] Polling error:', error);
      }

      // Wait before next poll
      await new Promise(resolve => setTimeout(resolve, this.pollingInterval));
    }
  }

  // Process received message
  async processMessage(message) {
    try {
      const body = JSON.parse(message.Body);
      const { event, data } = body;

      console.log(`[Scaleway SQS] Received ${event} event`);

      // Call registered handlers
      const handlers = this.handlers.get(event);
      if (handlers && handlers.length > 0) {
        for (const handler of handlers) {
          try {
            await handler({ data });
          } catch (handlerError) {
            console.error(`[Scaleway SQS] Handler error for ${event}:`, handlerError);
          }
        }
      }

      // Delete message after successful processing
      const deleteCommand = new DeleteMessageCommand({
        QueueUrl: this.queueUrl,
        ReceiptHandle: message.ReceiptHandle
      });
      await this.client.send(deleteCommand);

    } catch (error) {
      console.error('[Scaleway SQS] Failed to process message:', error);
    }
  }

  // Stop polling
  stopPolling() {
    this.isPolling = false;
  }
}

// Export singleton instance
module.exports = new ScalewaySQSAdapter(); 