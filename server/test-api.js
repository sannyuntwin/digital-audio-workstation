/**
 * Simple API Test Script
 * Test the Web DAW server endpoints
 */

const http = require('http');

// Test data
const testData = {
  name: 'Test Project',
  description: 'A test project for the Web DAW',
  bpm: 140,
  timeSignature: { numerator: 4, denominator: 4 }
};

// Function to make HTTP requests
function makeRequest(options, data = null) {
  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => {
        body += chunk;
      });
      res.on('end', () => {
        try {
          const response = JSON.parse(body);
          resolve({ status: res.statusCode, data: response });
        } catch (err) {
          resolve({ status: res.statusCode, data: body });
        }
      });
    });

    req.on('error', (err) => {
      reject(err);
    });

    if (data) {
      req.write(JSON.stringify(data));
    }
    req.end();
  });
}

// Test functions
async function testHealth() {
  console.log('🏥 Testing health endpoint...');
  try {
    const options = {
      hostname: 'localhost',
      port: 8000,
      path: '/health',
      method: 'GET'
    };

    const response = await makeRequest(options);
    console.log('✅ Health check:', response.status, response.data);
  } catch (error) {
    console.error('❌ Health check failed:', error.message);
  }
}

async function testCreateProject() {
  console.log('\n📁 Testing project creation...');
  try {
    const options = {
      hostname: 'localhost',
      port: 8000,
      path: '/api/projects',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      }
    };

    const response = await makeRequest(options, testData);
    console.log('✅ Project created:', response.status, response.data);
    return response.data.data?.id;
  } catch (error) {
    console.error('❌ Project creation failed:', error.message);
  }
}

async function testGetProjects() {
  console.log('\n📋 Testing get all projects...');
  try {
    const options = {
      hostname: 'localhost',
      port: 8000,
      path: '/api/projects',
      method: 'GET'
    };

    const response = await makeRequest(options);
    console.log('✅ Projects retrieved:', response.status, response.data);
  } catch (error) {
    console.error('❌ Get projects failed:', error.message);
  }
}

async function testAudioFormats() {
  console.log('\n🎵 Testing audio formats endpoint...');
  try {
    const options = {
      hostname: 'localhost',
      port: 8000,
      path: '/api/audio/formats',
      method: 'GET'
    };

    const response = await makeRequest(options);
    console.log('✅ Audio formats:', response.status, response.data);
  } catch (error) {
    console.error('❌ Audio formats failed:', error.message);
  }
}

// Run all tests
async function runTests() {
  console.log('🧪 Starting API Tests...\n');
  
  await testHealth();
  await testCreateProject();
  await testGetProjects();
  await testAudioFormats();
  
  console.log('\n🎉 API Tests Complete!');
}

// Run tests
runTests().catch(console.error);
