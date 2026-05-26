const axios = require('axios');
const { getValidToken } = require('./auth');
const DataPoint = require('../../models/DataPoint');

const fitbitApi = async (userId, path) => {
  const token = await getValidToken(userId);
  const { data } = await axios.get(`https://api.fitbit.com${path}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return data;
};

const today = () => new Date().toISOString().split('T')[0];

const fetchSteps = async (userId) => {
  const data = await fitbitApi(userId, `/1/user/-/activities/steps/date/${today()}/7d.json`);
  const steps = data['activities-steps'];
  await DataPoint.insert(userId, 'fitness', 'steps', steps, new Date());
  return steps;
};

const fetchSleep = async (userId) => {
  const data = await fitbitApi(userId, `/1.2/user/-/sleep/date/${today()}.json`);
  await DataPoint.insert(userId, 'fitness', 'sleep', data.summary, new Date());
  return data.summary;
};

const fetchHeartRate = async (userId) => {
  const data = await fitbitApi(userId, `/1/user/-/activities/heart/date/${today()}/1d.json`);
  const hr = data['activities-heart']?.[0]?.value;
  await DataPoint.insert(userId, 'fitness', 'heart_rate', hr || {}, new Date());
  return hr;
};

const fetchAll = async (userId) => {
  const [steps, sleep, heartRate] = await Promise.all([
    fetchSteps(userId),
    fetchSleep(userId),
    fetchHeartRate(userId),
  ]);
  return { steps, sleep, heartRate };
};

module.exports = { fetchSteps, fetchSleep, fetchHeartRate, fetchAll };
