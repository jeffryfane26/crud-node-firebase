const express = require('express');
const app = express();
const port = 8383;
const crypto = require('crypto');
const { firestore } = require('./firebase.js');

app.use(express.json());

const createUser = async (req, res) => {
    try {
        const { username, email, password } = req.body;
        if (!username || !email || !password) {
            throw new Error('Missing required fields: username, email, password');
        }
        const user = {
            id: crypto.randomUUID(),
            username,
            email,
            password,
            createdAt: new Date()
        };
        const userRef = firestore.collection('users').doc(user.id);
        await userRef.set(user);
        return res.status(201).json({
            status: 'success',
            message: 'User created successfully',
            data: {
                id: user.id,
                username: user.username,
                email: user.email,
                createdAt: user.createdAt
            }
        });
    } catch (error) {
        return res.status(500).json({
            status: 'fail',
            message: error.message || 'Internal Server Error'
        });
    }
};

const getUsers = async (req, res) => {
    try {
        const usersSnapshot = await firestore.collection('users').get();
        const users = usersSnapshot.docs.map(doc => doc.data());
        return res.status(200).json({
            status: 'success',
            message: 'Users retrieved successfully',
            data: users
        });
    } catch (error) {
        return res.status(500).json({
            status: 'fail',
            message: error.message || 'Internal Server Error'
        });
    }
};

const getUserById = async (req, res) => {
    try {
        const { id } = req.params;
        const userRef = firestore.collection('users').doc(id);
        const userDoc = await userRef.get();
        if (!userDoc.exists) {
            return res.status(404).json({
                status: 'fail',
                message: 'User not found'
            });
        }
        const user = userDoc.data();
        return res.status(200).json({
            status: 'success',
            message: 'User retrieved successfully',
            data: {
                id: user.id,
                username: user.username,
                email: user.email,
                createdAt: user.createdAt
            }
        });
    } catch (error) {
        return res.status(500).json({
            status: 'fail',
            message: error.message || 'Internal Server Error'
        });
    }
};

const updateUser = async (req, res) => {
    try {
        const { id } = req.params;
        const { username, email, password } = req.body;
        const userRef = firestore.collection('users').doc(id);
        const userDoc = await userRef.get();
        if (!userDoc.exists) {
            return res.status(404).json({
                status: 'fail',
                message: 'User not found'
            });
        }
        const user = {
            username,
            email,
            password,
            updatedAt: new Date()
        };
        await userRef.update(user);
        return res.status(200).json({
            status: 'success',
            message: 'User updated successfully',
            data: {
                id: id,
                username: username,
                email: email,
                createdAt: userDoc.data().createdAt,
                updatedAt: user.updatedAt
            }
        });
    } catch (error) {
        return res.status(500).json({
            status: 'fail',
            message: error.message || 'Internal Server Error'
        });
    }
};

const deleteUser = async (req, res) => {
    try {
        const { id } = req.params;
        const userRef = firestore.collection('users').doc(id);
        const userDoc = await userRef.get();
        if (!userDoc.exists) {
            return res.status(404).json({
                status: 'fail',
                message: 'User not found'
            });
        }
        await userRef.delete();
        return res.status(200).json({
            status: 'success',
            message: 'User deleted successfully'
        });
    } catch (error) {
        return res.status(500).json({
            status: 'fail',
            message: error.message || 'Internal Server Error'
        });
    }
};
const updateUserPassword = async (req, res) => {
    try {
        const { id } = req.params;
        const { newPassword } = req.body;
        const userRef = firestore.collection('users').doc(id);
        const userDoc = await userRef.get();
        if (!userDoc.exists) {
            return res.status(404).json({
                status: 'fail',
                message: 'User not found'
            });
        }
        await userRef.update({ password: newPassword });
        return res.status(200).json({
            status: 'success',
            message: 'User password updated successfully'
        });
    } catch (error) {
        return res.status(500).json({
            status: 'fail',
            message: error.message || 'Internal Server Error'
        });
    }
};

app.patch('/users/:id/password', updateUserPassword);
app.post('/users', createUser);
app.get('/users', getUsers);
app.get('/users/:id', getUserById);
app.patch('/users/:id', updateUser);
app.delete('/users/:id', deleteUser);

app.listen(port, () => console.log(`Server has started on port: ${port}`));
