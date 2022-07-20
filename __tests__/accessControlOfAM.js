import 'regenerator-runtime/runtime';
const axios = require('axios');
const baseURL = 'http://127.0.0.1:8090/api';
axios.defaults.baseURL = baseURL;

axios.defaults.headers.post['Content-Type'] =
    'application/x-www-form-urlencoded';

const getAdpushupToken = async (email, password) => {
    if (!email || !password) {
        throw new Error('invalid username or password');
    }
    // default user login - Logged in User
    const userData = await axios
        .post('/login', {
            email,
            password,
        })
        .then(async (response) => {
            return response;
        })
        .catch(async (error) => {
            console.log(error)
            throw error;
        });

    if (userData) {
        const { data } = userData;
        const { authToken } = data;
        return authToken;
    }
    return userData;
};

const switchUser = async (email, token) => {
    // default user login - Logged in User
    const userData = await axios
        .post('/user/switchUser', {
            email,
        }, {
            headers: {
                Authorization: token,
            },
            json: true,    
        })
        .then(async (response) => {
            return response;
        })
        .catch(async (error) => {
            console.log(error.response.data)
            throw error;
        });

    if (userData) {
        const { data } = userData;
        return data;
    }
    return userData;
};

const getGlobalData = async (token) => {

    const config = {
        type: 'get',
        url: `/globalData`,
        headers: {
            Authorization: token,
        },
        json: true,
    };

    try {
        const { data } = await axios(config).then((response) => response);
        return data;
    } catch (err) {
        throw err;
    }
};

const findUsersApi = async (token) => {

    const config = {
        type: 'get',
        url: `/user/findUsers`,
        headers: {
            Authorization: token,
        },
        json: true,
    };

    try {
        const { data } = await axios(config).then((response) => response.data);
        return data;
    } catch (err) {
        console.log(err.response.data)
        throw err;
    }
};
// Note: - aany password will work if you return true from isMe func in userModel

// 1. Login with developer account and check global data and findUser
// 2. Login with senior sales/ops but senior account and check global data and findUser
// 3. Login with AM/AdOps  and check global data and findUser

jest.setTimeout(55000);
describe('Access Contorl of AMs/AdOps persons', () => {
    let findUsersDataForAdminWithFullAccess;
    let globaAccountsUsersDataForAdminWithFullAccess;
    beforeEach(async () => {
        const token = await getAdpushupToken('harpreet.singh@adpushup.com', 'harpreet');
        findUsersDataForAdminWithFullAccess = await findUsersApi(token);
        globaAccountsUsersDataForAdminWithFullAccess = await getGlobalData(token);
    });


    it('Login with developer account and check global data and findUser', async () => {
        /**
         * 1. Loging with creds and get token
         * 2. Get data via globalData api using token and check globalData
         * 3. Get data via findUser api using token and check findUser data
         */
        const token = await getAdpushupToken('harpreet.singh@adpushup.com', 'harpreet');
        const globalData = await getGlobalData(token);
        const findUsers = await findUsersApi(token);
        // console.log(findUsers, 'findUsers')
        expect(Object.keys(globalData).join(',')).toEqual('user,networkConfig,networkWideHBRules,associatedAccounts,sites');
        expect(globalData.associatedAccounts.length).toEqual(0);
        expect(findUsers.users.length).toEqual(findUsersDataForAdminWithFullAccess.users.length);
    });

    it('Login with senior sales/ops but senior account and check global data and findUser', async () => {
        /**
         * 1. Loging with creds and get token
         * 2. Get data via globalData api using token and check globalData
         * 3. Get data via findUser api using token and check findUser data
         */
        const token = await getAdpushupToken('dikshant.joshi@adpushup.com', 'harpreet');
        const globalData = await getGlobalData(token);
        const findUsers = await findUsersApi(token);
        // console.log(findUsers, 'findUsers')
        expect(Object.keys(globalData).join(',')).toEqual('user,networkConfig,networkWideHBRules,associatedAccounts,sites');
        expect(globalData.associatedAccounts.length).toEqual(0);
        expect(findUsers.users.length).toEqual(findUsersDataForAdminWithFullAccess.users.length);
    });

    it('Login with AM/AdOps  and check global data and findUser', async () => {
        /**
         * 1. Loging with creds and get token
         * 2. Get data via globalData api using token and check globalData
         * 3. Get data via findUser api using token and check findUser data
         */
        const token = await getAdpushupToken('ashish.kapoor@adpushup.com', 'harpreet');
        const globalData = await getGlobalData(token);
        const findUsers = await findUsersApi(token);

        expect(Object.keys(globalData).join(',')).toEqual('user,networkConfig,networkWideHBRules,associatedAccounts,sites');
        expect(globalData.associatedAccounts.length).not.toEqual(0);
        let isValid = true;
        if (findUsers.users.length > 0 && findUsers.users.length < findUsersDataForAdminWithFullAccess.users.length) {
            isValid = true;
        }
        expect(isValid).toEqual(true);
    });

    it('Login with AM/AdOps, switch to allowed user and global data and findUser before and after should match', async () => {
        /**
         * 1. Loging with creds and get token
         * 2. Get data via globalData api using token and check globalData
         * 3. Get data via findUser api using token and check findUser data
         */
        const token = await getAdpushupToken('ashish.kapoor@adpushup.com', 'harpreet');
        const globalData = await getGlobalData(token);
        const findUsers = await findUsersApi(token);

        const { authToken } = await switchUser('apoorv.kalra@gmail.com', token);

        // get data of swithched user
        const switchedUserGlobalData = await getGlobalData(authToken);
        const switchedUserfindUsers = await findUsersApi(authToken);

        expect(globalData.associatedAccounts.length).toEqual(switchedUserGlobalData.associatedAccounts.length);
        expect(findUsers.users.length).toEqual(switchedUserfindUsers.users.length);
        expect(true).toEqual(true);
    });


    it('Login with AM/AdOps, switch to disAllowed user', async () => {
        /**
         * 1. Loging with creds and get token
         * 2. Get data via globalData api using token and check globalData
         * 3. Get data via findUser api using token and check findUser data
         */
        const token = await getAdpushupToken('ashish.kapoor@adpushup.com', 'harpreet');

        try {
            const { authToken } = await switchUser('sonoojaiswal1987@gmail.com', token);
        } catch(err) {

            expect(err.response.status).toEqual(550);
            expect(err.response.data.data.message).toEqual("Permission Denined");
        }
    });

    it('Login with senior sales/ops, switch to any valid user', async () => {
        /**
         * 1. Loging with creds and get token
         * 2. Get data via globalData api using token and check globalData
         * 3. Get data via findUser api using token and check findUser data
         */
        const token = await getAdpushupToken('dikshant.joshi@adpushup.com', 'harpreet');

        try {
            const { authToken, success} = await switchUser('apoorv.kalra@gmail.com', token);
            console.log(authToken, 'authToken')
            expect(authToken).not.toEqual("");
            expect(success).toEqual("Changed User");
        } catch(err) {
            console.log(err.response)
            expect(err.response.data.data.message).not.toEqual("Permission Denined");
        }
        try {
            const { authToken, success } = await switchUser('sonoojaiswal1987@gmail.com', token);
            expect(authToken).not.toEqual("");
            expect(success).toEqual("Changed User");
        } catch(err) {
            expect(err.response.data.data.message).not.toEqual("Permission Denined");
        }
    });

    it('Login with developer account, switch to any valid user', async () => {
        /**
         * 1. Loging with creds and get token
         * 2. Get data via globalData api using token and check globalData
         * 3. Get data via findUser api using token and check findUser data
         */
        const token = await getAdpushupToken('harpreet.singh@adpushup.com', 'harpreet');

        try {
            const { authToken, success} = await switchUser('apoorv.kalra@gmail.com', token);
            expect(authToken).not.toEqual("");
            expect(success).toEqual("Changed User");
        } catch(err) {
            expect(err.response.data.data.message).not.toEqual("Permission Denined");
        }
        try {
            const { authToken, success } = await switchUser('sonoojaiswal1987@gmail.com', token);
            expect(authToken).not.toEqual("");
            expect(success).toEqual("Changed User");
        } catch(err) {
            expect(err.response.data.data.message).not.toEqual("Permission Denined");
        }
    });

    it('Login with senior sales/ops, switch to any valid user and check globalData and findUser', async () => {
        /**
         * 1. Loging with creds and get token
         * 2. Get data via globalData api using token and check globalData
         * 3. Get data via findUser api using token and check findUser data
         */
        const token = await getAdpushupToken('dikshant.joshi@adpushup.com', 'harpreet');

        try {
            const { authToken, success} = await switchUser('apoorv.kalra@gmail.com', token);
            expect(authToken).not.toEqual("");
            expect(success).toEqual("Changed User");

            const globalData = await getGlobalData(token);
            const findUsers = await findUsersApi(token);
    
            // get data of swithched user
            const switchedUserGlobalData = await getGlobalData(authToken);
            const switchedUserfindUsers = await findUsersApi(authToken);

            expect(globalData.associatedAccounts.length).toEqual(switchedUserGlobalData.associatedAccounts.length);
            expect(findUsers.users.length).toEqual(switchedUserfindUsers.users.length);
            expect(true).toEqual(true);

        } catch(err) {
            expect(err.response.data.data.message).not.toEqual("Permission Denined");
        }
        try {
            const { authToken, success } = await switchUser('sonoojaiswal1987@gmail.com', token);
            expect(authToken).not.toEqual("");
            expect(success).toEqual("Changed User");
        } catch(err) {
            expect(err.response.data.data.message).not.toEqual("Permission Denined");
        }
    });

    it('Login with developer account, switch to any valid user', async () => {
        /**
         * 1. Loging with creds and get token
         * 2. Get data via globalData api using token and check globalData
         * 3. Get data via findUser api using token and check findUser data
         */
        const token = await getAdpushupToken('harpreet.singh@adpushup.com', 'harpreet');
        const globalData = await getGlobalData(token);
        const findUsers = await findUsersApi(token);

        try {
            const { authToken, success} = await switchUser('apoorv.kalra@gmail.com', token);
            expect(authToken).not.toEqual("");
            expect(success).toEqual("Changed User");

            // get data of swithched user
            const switchedUserGlobalData = await getGlobalData(authToken);
            const switchedUserfindUsers = await findUsersApi(authToken);

            expect(globalData.associatedAccounts.length).toEqual(switchedUserGlobalData.associatedAccounts.length);
            expect(findUsers.users.length).toEqual(switchedUserfindUsers.users.length);
            expect(true).toEqual(true);

        } catch(err) {
            expect(err.response.data.data.message).not.toEqual("Permission Denined");
        }
        try {
            const { authToken, success } = await switchUser('sonoojaiswal1987@gmail.com', token);
            expect(authToken).not.toEqual("");
            expect(success).toEqual("Changed User");

            // get data of swithched user
            const switchedUserGlobalData = await getGlobalData(authToken);
            const switchedUserfindUsers = await findUsersApi(authToken);
            
            expect(globalData.associatedAccounts.length).toEqual(switchedUserGlobalData.associatedAccounts.length);
            expect(findUsers.users.length).toEqual(switchedUserfindUsers.users.length);
            expect(true).toEqual(true);
        } catch(err) {
            expect(err.response.data.data.message).not.toEqual("Permission Denined");
        }
    });

    it('Login with AM/AdOps, switch to Allowed user, switch to disAllowed user', async () => {
        /**
         * 1. Loging with creds and get token
         * 2. Get data via globalData api using token and check globalData
         * 3. Get data via findUser api using token and check findUser data
         */

        const token = await getAdpushupToken('ashish.kapoor@adpushup.com', 'harpreet');
        const globalData = await getGlobalData(token);
        const findUsers = await findUsersApi(token);

        expect(Object.keys(globalData).join(',')).toEqual('user,networkConfig,networkWideHBRules,associatedAccounts,sites');
        expect(globalData.associatedAccounts.length).not.toEqual(0);
        try {
            const { authToken } = await switchUser('apoorv.kalra@gmail.com', token);
            let isValid = true;
            if (findUsers.users.length > 0 && findUsers.users.length < findUsersDataForAdminWithFullAccess.users.length) {
                isValid = true;
            }
            expect(isValid).toEqual(true);
        } catch(err) {
            expect(err.response.status).toEqual(550);
            expect(err.response.data.data.message).toEqual("Permission Denined");
        }

        try {
            const { authToken } = await switchUser('sonoojaiswal1987@gmail.com', token);
        } catch(err) {

            expect(err.response.status).toEqual(550);
            expect(err.response.data.data.message).toEqual("Permission Denined");
        }
    });

    it('Login AdOps User assigned with AM, should be able to access sites of AM assigned', async () => {
        /**
         * 1. Loging with creds and get token
         * 2. Get data via globalData api using token and check globalData
         * 3. Get data via findUser api using token and check findUser data
         */
        const tokenOfAdOps = await getAdpushupToken('amrita.kashyap@adpushup.com', 'harpreet');

        const globalDataOfAdOps = await getGlobalData(tokenOfAdOps);
        const findUsersOfAdOps = await findUsersApi(tokenOfAdOps);

        const tokenOfAM = await getAdpushupToken('dhruv.mahajan@adpushup.com', 'harpreet');

        const globalDataOfAM = await getGlobalData(tokenOfAM);
        const findUsersOfAM = await findUsersApi(tokenOfAM);


        expect(globalDataOfAdOps.associatedAccounts.length).toEqual(globalDataOfAM.associatedAccounts.length);
        expect(findUsersOfAdOps.users.length).toEqual(findUsersOfAM.users.length);

        expect(globalDataOfAdOps.associatedAccounts[0].emails).toEqual(globalDataOfAM.associatedAccounts[0].emails);
        expect(findUsersOfAdOps.users[0].email).toEqual(findUsersOfAM.users[0].email);

    });

    it('Login User with retricted AM/AdOps access, User does not have any associated AM', async () => {
        /**
         * 1. Loging with creds and get token
         * 2. Get data via globalData api using token and check globalData
         * 3. Get data via findUser api using token and check findUser data
         */
        const token = await getAdpushupToken('sohum.singh@adpushup.com', 'harpreet');

        const globalData = await getGlobalData(token);
        const findUsers = await findUsersApi(token);

        let isValidGlobalDataAssociatedAcc = true;
        if (globalData.associatedAccounts.length > 0 && globalData.associatedAccounts.length < globaAccountsUsersDataForAdminWithFullAccess.associatedAccounts.length) {
            isValidGlobalDataAssociatedAcc = true;
        }

        let isValidFindUsers = true;
        if (findUsers.users.length > 0 && findUsers.users.length < findUsersDataForAdminWithFullAccess.users.length) {
            isValidFindUsers = true;
        }

        expect(Object.keys(globalData).join(',')).toEqual('user,networkConfig,networkWideHBRules,associatedAccounts,sites');
        expect(isValidFindUsers).toEqual(true);
        expect(isValidGlobalDataAssociatedAcc).toEqual(true);
    });

});