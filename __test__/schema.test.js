const mongoose = require('mongoose')
const mockingoose = require('mockingoose')
const User = require('../models/userModel')
const UserType = require('../models/userTypesModel')

beforeEach(() => {
    mockingoose.resetAll();
});

describe('Test mongoose user model', () => {

    it('Should return the doc with findById', async () => {
        const _doc = {
            _id: "6338988daf572b59261188b6",
        }

        mockingoose(User).toReturn(_doc, 'findOne');

        const doc = await User.findOne({ _id: '6338988daf572b59261188b6' })
        expect(JSON.parse(JSON.stringify(doc))._id).toBe(_doc._id)
    })

    it('Should return a new doc with save', async () => {
        // const _doc = {
        //     email: 'example@email.com',
        //     firstName: 'Mock',
        //     lastName: 'User',
        //     loginType: "63385f6343208e8daa8656f8",
        //     userType: "6336a7646eb5b6eb3019afd8"
        // }

        // mockingoose(User).toReturn(_doc, 'save');

        // const doc = await User.create({
        //     email: 'example@email.com',
        //     firstName: 'Mock',
        //     lastName: 'User',
        //     loginType: "63385f6343208e8daa8656f8",
        //     userType: "6336a7646eb5b6eb3019afd8"
        // })
        // console.log("==================================================");
        // console.log(doc);
        // expect(JSON.parse(JSON.stringify(doc))).toMatchObject(_doc)
    })

})

afterEach(() => {
    mockingoose.resetAll();
})