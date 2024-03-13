const bcypt = require('bcrypt')

const passHash = async (password) => {
    return await bcypt.hash(password, 10);
}

const verifyPassHash = async (password, hashPass) => {
    return await bcypt.compare(password, hashPass)
}

module.exports = { passHash, verifyPassHash }