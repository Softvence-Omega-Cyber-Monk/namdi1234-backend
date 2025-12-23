// src/controllers/cms.controller.ts
import { Request, Response } from 'express';
import { Topbar, Hero, Footer } from './cms.model';

// ========== TOPBAR CONTROLLERS ==========
export const getTopbar = async (req: Request, res: Response) => {
  try {
    let topbar = await Topbar.findOne({ isActive: true }).sort({ createdAt: -1 });
    
    // If no topbar exists, create a default one
    if (!topbar) {
      topbar = await Topbar.create({
        backgroundColor: '#000000',
        textColor: '#FFFFFF',
        content: 'Welcome to MDItems',
        isActive: true,
      });
    }

    res.status(200).json({
      success: true,
      data: topbar,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching topbar',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};

export const updateTopbar = async (req: Request, res: Response) => {
  try {
    const { backgroundColor, textColor, content } = req.body;

    // Validation
    if (!backgroundColor || !textColor || !content) {
      return res.status(400).json({
        success: false,
        message: 'All fields are required: backgroundColor, textColor, content',
      });
    }

    // Find the active topbar and update it, or create if none exists
    let topbar = await Topbar.findOne({ isActive: true });

    if (topbar) {
      topbar.backgroundColor = backgroundColor;
      topbar.textColor = textColor;
      topbar.content = content;
      await topbar.save();
    } else {
      topbar = await Topbar.create({
        backgroundColor,
        textColor,
        content,
        isActive: true,
      });
    }

    res.status(200).json({
      success: true,
      message: 'Topbar updated successfully',
      data: topbar,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error updating topbar',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};

// ========== HERO CONTROLLERS ==========
export const getHero = async (req: Request, res: Response) => {
  try {
    let hero = await Hero.findOne({ isActive: true }).sort({ createdAt: -1 });
    
    // If no hero exists, create a default one
    if (!hero) {
      hero = await Hero.create({
        title: 'Welcome to MDItems',
        description: 'Your one-stop shop for quality products',
        image: 'https://via.placeholder.com/1920x600',
        buttonText: 'Start Shopping Now',
        buttonLink: '/shop',
        overlayOpacity: 0.6,
        isActive: true,
      });
    }

    res.status(200).json({
      success: true,
      data: hero,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching hero section',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};

export const updateHero = async (req: Request, res: Response) => {
  try {
    const { title, description, image, buttonText, buttonLink, overlayOpacity } = req.body;

    // Validation
    if (!title || !description || !image) {
      return res.status(400).json({
        success: false,
        message: 'Required fields: title, description, image',
      });
    }

    // Find the active hero and update it, or create if none exists
    let hero = await Hero.findOne({ isActive: true });

    if (hero) {
      hero.title = title;
      hero.description = description;
      hero.image = image;
      hero.buttonText = buttonText || hero.buttonText;
      hero.buttonLink = buttonLink || hero.buttonLink;
      hero.overlayOpacity = overlayOpacity !== undefined ? overlayOpacity : hero.overlayOpacity;
      await hero.save();
    } else {
      hero = await Hero.create({
        title,
        description,
        image,
        buttonText: buttonText || 'Start Shopping Now',
        buttonLink: buttonLink || '/shop',
        overlayOpacity: overlayOpacity !== undefined ? overlayOpacity : 0.6,
        isActive: true,
      });
    }

    res.status(200).json({
      success: true,
      message: 'Hero section updated successfully',
      data: hero,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error updating hero section',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};

// ========== FOOTER CONTROLLERS ==========
export const getFooter = async (req: Request, res: Response) => {
  try {
    let footer = await Footer.findOne({ isActive: true }).sort({ createdAt: -1 });
    
    // If no footer exists, create a default one
    if (!footer) {
      footer = await Footer.create({
        logo: 'https://via.placeholder.com/150x50',
        description: 'Your trusted online shopping destination',
        address: '123 Main Street, City, Country',
        email: 'info@mditems.com',
        phone: '+1 234 567 8900',
        socialLinks: {},
        copyright: '© 2024 MDItems. All rights reserved.',
        privacyPolicy: 'Add your privacy policy here',
        shippingPolicy: 'Add your shipping policy here',
        refundPolicy: 'Add your refund policy here',
        isActive: true,
      });
    }

    res.status(200).json({
      success: true,
      data: footer,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching footer',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};

export const updateFooter = async (req: Request, res: Response) => {
  try {
    const { logo, description, address, email, phone, socialLinks, copyright, privacyPolicy, shippingPolicy, refundPolicy } = req.body;

    // Validation
    if (!logo || !description || !address || !email || !phone || !copyright || !privacyPolicy || !shippingPolicy || !refundPolicy) {
      return res.status(400).json({
        success: false,
        message: 'All fields are required: logo, description, address, email, phone, copyright, privacyPolicy, shippingPolicy, refundPolicy',
      });
    }

    // Find the active footer and update it, or create if none exists
    let footer = await Footer.findOne({ isActive: true });

    if (footer) {
      footer.logo = logo;
      footer.description = description;
      footer.address = address;
      footer.email = email;
      footer.phone = phone;
      footer.socialLinks = socialLinks || footer.socialLinks;
      footer.copyright = copyright;
      footer.privacyPolicy = privacyPolicy;
      footer.shippingPolicy = shippingPolicy;
      footer.refundPolicy = refundPolicy;
      await footer.save();
    } else {
      footer = await Footer.create({
        logo,
        description,
        address,
        email,
        phone,
        socialLinks: socialLinks || {},
        copyright,
        privacyPolicy,
        shippingPolicy,
        refundPolicy,
        isActive: true,
      });
    }

    res.status(200).json({
      success: true,
      message: 'Footer updated successfully',
      data: footer,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error updating footer',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
}