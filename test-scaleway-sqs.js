// Test script for Scaleway SQS integration
const scalewaySQS = require('./srv/integrations/scaleway-sqs');

async function testScalewaySQS() {
  console.log('🧪 Testing Scaleway SQS Integration');
  console.log('===================================\n');

  try {
    // Test 1: Send a test message
    console.log('📤 Test 1: Sending test message...');
    await scalewaySQS.emit('TestEvent', {
      message: 'Hello from CoffeeX!',
      timestamp: new Date().toISOString()
    });
    console.log('✅ Message sent successfully!\n');

    // Test 2: Send a RefillEvent
    console.log('📤 Test 2: Sending RefillEvent...');
    await scalewaySQS.emit('RefillEvent', {
      machineId: 'test-machine-123',
      qtyGram: 500,
      timestamp: new Date().toISOString()
    });
    console.log('✅ RefillEvent sent successfully!\n');

    // Test 3: Subscribe to messages
    console.log('👂 Test 3: Setting up message listener...');
    scalewaySQS.on('TestEvent', async (msg) => {
      console.log('📨 Received TestEvent:', msg.data);
    });

    scalewaySQS.on('RefillEvent', async (msg) => {
      console.log('📨 Received RefillEvent:', msg.data);
    });

    console.log('✅ Listeners set up successfully!');
    console.log('\n⏰ Waiting 30 seconds for messages...');
    console.log('   (Send messages to the queue to test reception)\n');

    // Keep the script running for 30 seconds to receive messages
    setTimeout(() => {
      console.log('\n🏁 Test completed!');
      scalewaySQS.stopPolling();
      process.exit(0);
    }, 30000);

  } catch (error) {
    console.error('❌ Test failed:', error);
    process.exit(1);
  }
}

// Run the test
testScalewaySQS(); 