const bcrypt = require('bcrypt');

const handleNewUser = async (req, res) => {
    const { user, pwd } = req.body;
    if (!user || !pwd) return res.status(400).json({ 'message': 'Username and password are required'});

    //check for duplicate usernames in the db
    // const duplicate = await User.findOne({ username: user}).exec(); need to change this to a sql query
    if (duplicate) return res.sendStatus(409); //conflict
    try{
        //encrypt password
        const hashedPwd = await bcrypt.hash(pwd, 10);
        //create and store the new User
        // const result  = await User.create({
        //     'username': user,
        //     "password": hashedPwd
        // }); change this to create entry in users table in sql database
        console.log(result);
        res.status(201).json({ 'success': `New user ${user} created!`});
    }catch(err){
        res.status(500).json({ 'message': err.message})
    }
}

module.exports = {
    handleNewUser
};