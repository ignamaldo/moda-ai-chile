import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs, updateDoc, doc } from 'firebase/firestore';
import { firebaseConfig } from './src/firebaseConfig.js';

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const appId = 'moda-ai-chile';

async function migrateProducts() {
    console.log('🔄 Starting migration: Adding status field to existing products...\n');

    try {
        const productsRef = collection(db, 'artifacts', appId, 'public', 'data', 'products');
        const snapshot = await getDocs(productsRef);

        console.log(`Found ${snapshot.docs.length} products to migrate.\n`);

        let updated = 0;
        let skipped = 0;

        for (const productDoc of snapshot.docs) {
            const data = productDoc.data();

            // If product already has status field, skip it
            if (data.status) {
                console.log(`⏭️  Skipping "${data.name}" - already has status: ${data.status}`);
                skipped++;
                continue;
            }

            // Update product with 'published' status
            await updateDoc(doc(db, 'artifacts', appId, 'public', 'data', 'products', productDoc.id), {
                status: 'published'
            });

            console.log(`✅ Updated "${data.name}" - set status to 'published'`);
            updated++;
        }

        console.log(`\n✨ Migration complete!`);
        console.log(`   - Updated: ${updated} products`);
        console.log(`   - Skipped: ${skipped} products`);

    } catch (error) {
        console.error('❌ Migration failed:', error);
        process.exit(1);
    }

    process.exit(0);
}

migrateProducts();
