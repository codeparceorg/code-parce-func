const { Firestore } = require('@google-cloud/firestore');
require('dotenv').config();


const firestore = new Firestore({
    projectId: process.env.TF_VAR_project_id,
    databaseId: process.env.TF_VAR_firesotre_id
});

const projects = require('./proyects.json');

exports.upData = async (req, res) => {
    try {
        const collection = firestore.collection('proyects');

        const batch = firestore.batch();

        projects.forEach((project) => {
            const docRef = collection.doc(); // ID automático
            batch.set(docRef, project);
        });

        await batch.commit();

        if (res) {
            return res.status(200).json({
                message: 'Proyectos subidos correctamente'
            });
        }

        console.log('Proyectos subidos correctamente');
    } catch (error) {
        console.error('Error subiendo proyectos:', error);

        if (res) {
            return res.status(500).json({ error: error.message });
        }
    }
};

exports.upData();