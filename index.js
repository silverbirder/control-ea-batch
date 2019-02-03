const fs = require('fs');
const parse = require('csv-parse/lib/sync');
const {Datastore} = require('@google-cloud/datastore');

// google cloud platform settings
const projectId = 'ma-web-tools';
const datastoreName = 'VipData';

// filepath
const filepath = "./eventdates.csv";

function saveVipData(dataList) {
    const datastore = new Datastore({
        projectId: projectId,
    });
    const VipKey = datastore.key(datastoreName);
    dataList.map(data => {
        const vipData = {
            key: VipKey,
            data: data,
        };
        datastore.save(vipData);
    })
}

function readCsv(filepath) {
    const data = fs.readFileSync(filepath);
    if (!data) {
        throw new Error('cannot find file');
    }
    const result = parse(data, { columns: true, ltrim: true, rtrim: true, escape: '\\' });
    return result;
}

function convert (dataList) {
    const data_reg = /^(\d{2})\/(\d{2})\/(\d{4})\s(\d{2}):(\d{2}):\d{2}$/;
    return dataList.map((data) => {
        matched_data = data.DateTime.match(data_reg);
        if (!matched_data) {
            return
        } else {
            return {
                'date': `${matched_data[3]}.${matched_data[1]}.${matched_data[2]} ${matched_data[4]}:${matched_data[5]}`,
                'title': data.Name,
                'currency': data.Currency,
                'volatility': parseInt(data.Volatility)
            }
        }
    });
}

const orgDataList = readCsv(filepath);
const convertedDataList = convert(orgDataList);
saveVipData(convertedDataList);