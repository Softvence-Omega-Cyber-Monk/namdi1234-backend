// src/scripts/seedCMS.ts
// Run this script once to initialize CMS data: node -r ts-node/register src/scripts/seedCMS.ts
import mongoose from 'mongoose';
import { Topbar, Hero, Footer } from '../app/modules/cms/cms.model';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/your-database-name';

async function seedCMS() {
    try {
        // Connect to MongoDB
        await mongoose.connect(MONGODB_URI);
        console.log('✅ Connected to MongoDB');

        // Check and create Topbar
        const topbarExists = await Topbar.findOne({ isActive: true });
        if (!topbarExists) {
            await Topbar.create({
                backgroundColor: '#000000',
                textColor: '#FFFFFF',
                content: 'Welcome to MDItems - Free Shipping on Orders Over $50!',
                isActive: true,
            });
            console.log('✅ Topbar created');
        } else {
            console.log('ℹ️  Topbar already exists');
        }

        // Check and create Hero
        const heroExists = await Hero.findOne({ isActive: true });
        if (!heroExists) {
            await Hero.create({
                title: 'Welcome to MDItems',
                description: 'Discover amazing products at unbeatable prices. Your one-stop shop for quality items.',
                image: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=1920',
                buttonText: 'Start Shopping Now',
                buttonLink: '/shop',
                overlayOpacity: 0.6,
                isActive: true,
            });
            console.log('✅ Hero section created');
        } else {
            console.log('ℹ️  Hero section already exists');
        }

        // Check and create Footer
        const footerExists = await Footer.findOne({ isActive: true });
        if (!footerExists) {
            await Footer.create({
                logo: 'https://via.placeholder.com/150x50/3B82F6/FFFFFF?text=MDItems',
                description: 'Your trusted online shopping destination. We bring you quality products with exceptional service.',
                address: '123 Commerce Street, Business District, New York, NY 10001',
                email: 'support@mditems.com',
                phone: '+1 (555) 123-4567',
                socialLinks: {
                    facebook: 'https://facebook.com/mditems',
                    twitter: 'https://twitter.com/mditems',
                    instagram: 'https://instagram.com/mditems',
                    linkedin: 'https://linkedin.com/company/mditems',
                },
                copyright: '© 2024 MDItems. All rights reserved.',
                privacyPolicy: `Privacy Policy

Last Updated: ${new Date().toLocaleDateString()}

1. Information We Collect
We collect information you provide directly to us, such as when you create an account, make a purchase, or contact us for support.

2. How We Use Your Information
We use the information we collect to process transactions, send you order confirmations, respond to your requests, and improve our services.

3. Information Sharing
We do not sell or rent your personal information to third parties. We may share your information with service providers who help us operate our business.

4. Data Security
We implement appropriate security measures to protect your personal information from unauthorized access and disclosure.

5. Your Rights
You have the right to access, correct, or delete your personal information. Contact us at privacy@mditems.com for any privacy-related concerns.

6. Cookies
We use cookies to enhance your browsing experience and analyze site traffic. You can control cookies through your browser settings.

7. Changes to This Policy
We may update this privacy policy from time to time. We will notify you of any changes by posting the new policy on this page.

Contact Us: privacy@mditems.com`,

                shippingPolicy: `Shipping Policy

Last Updated: ${new Date().toLocaleDateString()}

1. Shipping Methods
We offer standard and express shipping options. Shipping costs are calculated at checkout based on your location and order weight.

2. Processing Time
Orders are typically processed within 1-2 business days. You will receive a confirmation email with tracking information once your order ships.

3. Delivery Time
- Standard Shipping: 5-7 business days
- Express Shipping: 2-3 business days
- International Shipping: 10-15 business days

4. Free Shipping
We offer free standard shipping on orders over $50 within the continental United States.

5. International Shipping
We ship to most countries worldwide. International customers are responsible for any customs fees or import duties.

6. Order Tracking
Once your order ships, you'll receive a tracking number via email. You can track your package through our website or the carrier's website.

7. Shipping Restrictions
Some items cannot be shipped to certain locations due to size, weight, or legal restrictions.

Contact Us: shipping@mditems.com`,

                refundPolicy: `Refund & Return Policy

Last Updated: ${new Date().toLocaleDateString()}

1. Return Window
You may return most items within 30 days of delivery for a full refund. Items must be unused and in original packaging.

2. How to Initiate a Return
Contact our customer service team at returns@mditems.com with your order number and reason for return. We'll provide you with a return label.

3. Refund Processing
Once we receive and inspect your return, we'll process your refund within 5-7 business days. Refunds are issued to the original payment method.

4. Non-Returnable Items
The following items cannot be returned:
- Opened personal care items
- Custom or personalized products
- Sale or clearance items marked as final sale
- Digital downloads

5. Damaged or Defective Items
If you receive a damaged or defective item, contact us immediately at support@mditems.com. We'll arrange for a replacement or full refund.

6. Return Shipping Costs
Return shipping is free for defective or incorrect items. For other returns, customers are responsible for return shipping costs unless otherwise stated.

7. Exchanges
We currently don't offer direct exchanges. Please return the item for a refund and place a new order for the item you want.

8. Late or Missing Refunds
If you haven't received your refund after 7 business days, check with your bank first. Then contact us at support@mditems.com.

Contact Us: returns@mditems.com`,

                isActive: true,
            });
            console.log('✅ Footer created with policies');
        } else {
            console.log('ℹ️  Footer already exists');
        }

        console.log('\n🎉 CMS seeding completed successfully!');
        process.exit(0);
    } catch (error) {
        console.error('❌ Error seeding CMS:', error);
        process.exit(1);
    }
}

// Run the seed function
seedCMS();