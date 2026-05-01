import {reports} from '../config/mongoCollections.js';
import {ObjectId} from 'mongodb';
import {checkId} from '../helpers.js'

const validWifiStatuses = ['Fast', 'Moderately Fast', 'Slow'];
const validSocketStatuses = ['Enough', 'Moderately Enough', 'Full'];
const validCrowdednessStatuses = ['Quiet', 'Moderately Busy', 'Crowded', 'Full'];
const validTypes = ['status', 'closure'];
const validReviewStatuses = ['approved', 'rejected'];

export const createStatusReport = async (
    spotId,
    userId,
    wifiStatus, 
    socketStatus,
    crowdednessStatus
) => {
    spotId = checkId(spotId, 'spotId');
    userId = checkId(userId, 'userId');

    if (!validWifiStatuses.includes(wifiStatus)) throw 'Invalid WiFi status';
    if (!validSocketStatuses.includes(socketStatus)) throw 'Invalid socket status';
    if (!validCrowdednessStatuses.includes(crowdednessStatus)) throw 'Invalid crowdedness status';

    const reportCollection = await reports();
    const now = new Date();

    const newReport = {
        spotId: new ObjectId(spotId),
        userId: new ObjectId(userId),
        type: 'status',
        wifiStatus,
        socketStatus,
        crowdednessStatus,
        createdAt: now,
        expiresAt: new Date(now.getTime() + 90*60*1000)
    };

    const insertInfo = await reportCollection.insertOne(newReport);
        if (!insertInfo.acknowledged || !insertInfo.insertedId) throw 'Could not create status report';
        return { _id: insertInfo.insertedId.toString(), ...newReport };
    };

export const createClosureReport = async (spotId, userId) => {
    spotId = checkId(spotId, 'spotId');
    userId = checkId(userId, 'userId');

    const reportCollection = await reports();
    const now = new Date();

    const newReport = {
        spotId: new ObjectId(spotId),
        userId: new ObjectId(userId),
        type: 'closure',
        status: 'pending',
        resolvedBy: null,
        createdAt: now
    };

    const insertInfo = await reportCollection.insertOne(newReport);
    if (!insertInfo.acknowledged || !insertInfo.insertedId) throw 'Could not create closure report';
    
    return { _id: insertInfo.insertedId.toString(), ...newReport };
};

export const getActiveStatusReportsBySpotId = async(spotId) => {
    if (!ObjectId.isValid(spotId)) throw "Invalid spotId";
    const reportCollection = await reports();
    return await reportCollection.find({
        spotId: new ObjectId(spotId),
        type: 'status',
        expiresAt: {$gt: new Date()}
    }).toArray();
};

export const getAggregatedReportStatus = async(spotId) => {
    const reportCollection = await reports();

    if (activeReports.length === 0) {
        return {
            reportCount: 0,
            wifiStatus: 'No recent reports',
            socketStatus: 'No recent reports',
            crowdednessStatus: 'No recent reports'
        };
    }

    const getMostCommon = (reports, field) => {
        const counts = {};
        for (const report of reports) {
            const value = report[field];
            if (value) counts[value] = (counts[value] || 0) + 1;
        }
        let mostCommon = null;
        let maxCount = 0;
        for (const value in counts) {
            if (counts[value] > maxCount) {
                mostCommon = value;
                maxCount = counts[value];
            }
        }
        return mostCommon;
    };

    return {
        reportCount: activeReports.length,
        wifiStatus: getMostCommon(activeReports, 'wifiStatus'),
        socketStatus: getMostCommon(activeReports, 'socketStatus'),
        crowdednessStatus: getMostCommon(activeReports, 'crowdednessStatus')
    };
};

export const getPendingClosureReports = async() => {
    const reportCollection = await reports();
    return await reportCollection.find({
        type: 'closure',
        status: 'pending'
    }).sort({createdAt: -1}).toArray();
};

export const resolveClosureReport = async(reportId, adminId, status) => {
    reportId = checkId(reportId);
    adminId = checkId(adminId);
    if (!validReviewStatuses.includes(status)) throw 'Invalid status';

    const reportCollection = await reports();
    const updateInfo = await reportCollection.updateOne({
        _id: new ObjectId(reportId),
        type: 'closure'
    }, {
        $set: {
            status,
            resolvedBy: new ObjectId(adminId),
            resolvedAt: new Date()
        }
    });
    
    if (updateInfo.modifiedCount === 0) throw 'Could not resolve closure report';
    return true;
};