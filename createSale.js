const crypto = require('crypto');
const axios = require('axios'); // npm install axios
const {
  URL,
  CLIENT_ID,
  CLIENT_SECRET,
  ACCESS_KEY_PROD,
  ACCESS_SECRET_PROD,
} = require('./credentials');

const apiUrl = URL;
const clientId = CLIENT_ID;
const clientSecret = CLIENT_SECRET;
const accessKey = ACCESS_KEY_PROD;
const accessSecret = ACCESS_SECRET_PROD;

const authenticate = async () => {
  const timestamp = new Date().toISOString();

  const hmac = crypto
    .createHmac('sha256', accessSecret) // HMAC-SHA256 encryption takes a Key (accessSecret)
    .update(`${clientId}:${clientSecret}:${timestamp}`) // The message to encrypt
    .digest('base64'); // Encode the output

  const authorization = `SS ${accessKey}:${hmac}`;

  const headers = {
    'Content-Type': 'application/json',
    Authorization: authorization,
    Timestamp: timestamp,
  };

  const authBody = JSON.stringify({
    clientID: clientId,
    clientSecret,
  });

  const auth = await axios.post(`${apiUrl}/auth/login`, authBody, {
    headers,
  });

  return auth.data.Session;
};

const getOfficeGuid = async (sessionToken) => {
  try {
    const offices = await axios.get(`${apiUrl}/api/offices`, {
      headers: { Session: sessionToken },
    });

    return offices.data.value.offices[0].officeGuid;
  } catch (error) {
    console.error('failed to get the office guid');
    console.error('error office', error.data);
    return null;
  }
};

const getUserGuid = async (sessionToken, officeGuid) => {
  try {
    // Get the users in a specific office.
    const users = await axios.get(
      `${apiUrl}/api/users?officeGuid=${officeGuid}`,
      { headers: { Session: sessionToken } }
    );

    return users.data.value.users[0].userGuid;
  } catch (error) {
    console.error('failed to get the user guid');
    console.error('error user', error.data);
    return null;
  }
};

const getChecklistTypeId = async (sessionToken, officeGuid) => {
  try {
    // Get the checklist type for sales under a specific office.
    const checklistTypeIds = await axios.get(
      `${apiUrl}/api/offices/${officeGuid}/checklisttypes?transactionType=Sale`,
      { headers: { Session: sessionToken } }
    );

    return checklistTypeIds.data.value.checklistTypes[0].checklistTypeId;
  } catch (error) {
    console.error('failed to get the checklist type id');
    console.error('error user', error.data);
    return null;
  }
};

const main = async () => {
  const sessionToken = await authenticate();

  // To create a sale, you must specify for what office and what user this sale will belong to.
  // You must also specify what checklist to use for this sale.
  const officeGuid = await getOfficeGuid(sessionToken);
  const userGuid = await getUserGuid(sessionToken, officeGuid);
  const checklistTypeId = await getChecklistTypeId(sessionToken, officeGuid);

  const body = {
    mlsNumber: '222222',
    officeGuid: `${officeGuid}`,
    agentGuid: `${userGuid}`,
    checklistTypeId: `${checklistTypeId}`,
    sourceId: 44,
    apn: '123-456-789-123',
    contractAcceptanceDate: '2018-11-01',
    escrowClosingDate: '2018-11-03',
    property: {
      streetNumber: `${Math.floor(Math.random() * Math.max(99999))}`,
      streetAddress: 'Main St.',
      unit: '331',
      direction: 'N',
      city: 'Sacramento',
      county: 'Sacramento County',
      state: 'CA',
      zip: '95814',
      areasqft: '1200',
      yearBuilt: 2012,
    },
    salePrice: 333000,
  };

  const config = {
    headers: {
      Session: sessionToken,
      'Content-Type': 'application/json',
    },
  };

  axios
    .post(`${apiUrl}/api/files/sales`, JSON.stringify(body), config)
    .then((response) => {
      console.log('Request Response: \n', response.data);
    })
    .catch((error) => {
      console.error('error.response.data: ', error.response.data);
      return null;
    });
};

main();
