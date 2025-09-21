-- Insert Business Stationery services (categoryOrder = 1)
INSERT INTO Service (name, slug, description, category, "order", categoryOrder, isActive, configuratorEnabled, calculatorAvailable, clickCount, createdAt, updatedAt) VALUES
('Letterheads', 'letterheads', 'Professional business letterheads with company branding.', 'Business Stationery', 1, 1, 1, 0, 1, 0, datetime('now'), datetime('now')),
('Certificates', 'certificates', 'Official certificates and awards with premium printing.', 'Business Stationery', 2, 1, 1, 0, 1, 0, datetime('now'), datetime('now')),
('Compliment Slips', 'compliment-slips', 'Elegant compliment slips for professional communications.', 'Business Stationery', 3, 1, 1, 0, 1, 0, datetime('now'), datetime('now')),
('Business Cards', 'business-cards', 'High-quality business cards with premium paper stock.', 'Business Stationery', 4, 1, 1, 0, 1, 0, datetime('now'), datetime('now')),
('Appointment Cards', 'appointment-cards', 'Professional appointment cards for scheduling.', 'Business Stationery', 5, 1, 1, 0, 1, 0, datetime('now'), datetime('now')),
('Loyalty Cards', 'loyalty-cards', 'Custom loyalty cards for customer retention programs.', 'Business Stationery', 6, 1, 1, 0, 1, 0, datetime('now'), datetime('now')),
('NCR Pads of 50 A4 Triple', 'ncr-pads', 'Carbonless copy pads for forms and invoices.', 'Business Stationery', 7, 1, 1, 0, 1, 0, datetime('now'), datetime('now')),
('Overprint Envelopes BW', 'overprint-envelopes', 'Black and white overprinted envelopes.', 'Business Stationery', 8, 1, 1, 0, 1, 0, datetime('now'), datetime('now')),
('Membership Cards', 'membership-cards', 'Durable membership cards for organizations.', 'Business Stationery', 9, 1, 1, 0, 1, 0, datetime('now'), datetime('now'));

-- Insert Advertising services (categoryOrder = 2)
INSERT INTO Service (name, slug, description, category, "order", categoryOrder, isActive, configuratorEnabled, calculatorAvailable, clickCount, createdAt, updatedAt) VALUES
('Flyers', 'flyers', 'Eye-catching flyers to promote your business and events effectively.', 'Advertising', 1, 2, 1, 0, 1, 0, datetime('now'), datetime('now')),
('Leaflets Printing', 'leaflets', 'Informative leaflets for marketing and promotional campaigns.', 'Advertising', 2, 2, 1, 0, 1, 0, datetime('now'), datetime('now')),
('Posters', 'posters', 'Large format posters for advertising and promotional campaigns.', 'Advertising', 3, 2, 1, 0, 1, 0, datetime('now'), datetime('now'));

-- Insert Large Format Printing services (categoryOrder = 3)
INSERT INTO Service (name, slug, description, category, "order", categoryOrder, isActive, configuratorEnabled, calculatorAvailable, clickCount, createdAt, updatedAt) VALUES
('Drawing Printing', 'drawing-printing', 'High-quality technical drawings and blueprints.', 'Large Format Printing', 1, 3, 1, 0, 1, 0, datetime('now'), datetime('now')),
('Poster Printing', 'poster-printing', 'Large format poster printing up to A0 size.', 'Large Format Printing', 2, 3, 1, 0, 1, 0, datetime('now'), datetime('now'));

-- Insert Menu Printing services (categoryOrder = 4)
INSERT INTO Service (name, slug, description, category, "order", categoryOrder, isActive, configuratorEnabled, calculatorAvailable, clickCount, createdAt, updatedAt) VALUES
('Waterproof Menu', 'waterproof-menu', 'Durable waterproof menus for restaurants.', 'Menu Printing', 1, 4, 1, 0, 1, 0, datetime('now'), datetime('now')),
('Flat Restaurant Menu', 'flat-restaurant-menu', 'Single-page restaurant menus with elegant design.', 'Menu Printing', 2, 4, 1, 0, 1, 0, datetime('now'), datetime('now')),
('Folded Restaurant Menu', 'folded-restaurant-menu', 'Multi-page folded restaurant menus.', 'Menu Printing', 3, 4, 1, 0, 1, 0, datetime('now'), datetime('now')),
('Placemat Menu', 'placemat-menu', 'Functional placemat menus for dining tables.', 'Menu Printing', 4, 4, 1, 0, 1, 0, datetime('now'), datetime('now')),
('Takeaway Menu', 'takeaway-menu', 'Compact takeaway menus for delivery orders.', 'Menu Printing', 5, 4, 1, 0, 1, 0, datetime('now'), datetime('now'));

-- Insert Photocopying services (categoryOrder = 5)
INSERT INTO Service (name, slug, description, category, "order", categoryOrder, isActive, configuratorEnabled, calculatorAvailable, clickCount, createdAt, updatedAt) VALUES
('BW Photocopying', 'photocopying-bw', 'High-quality black and white photocopying services.', 'Photocopying', 1, 5, 1, 0, 1, 0, datetime('now'), datetime('now')),
('Colour Photocopying', 'photocopying-colour', 'Professional color photocopying with accurate color reproduction.', 'Photocopying', 2, 5, 1, 0, 1, 0, datetime('now'), datetime('now'));

-- Insert Booklet Printing services (categoryOrder = 6)
INSERT INTO Service (name, slug, description, category, "order", categoryOrder, isActive, configuratorEnabled, calculatorAvailable, clickCount, createdAt, updatedAt) VALUES
('A6-A4 Booklets', 'booklet-printing', 'Professional booklets from A6 to A4 size.', 'Booklet Printing', 1, 6, 1, 0, 1, 0, datetime('now'), datetime('now'));

-- Insert Events Printing services (categoryOrder = 7)
INSERT INTO Service (name, slug, description, category, "order", categoryOrder, isActive, configuratorEnabled, calculatorAvailable, clickCount, createdAt, updatedAt) VALUES
('Wedding Stationery', 'wedding-stationery', 'Complete wedding stationery suite for your special day.', 'Events Printing', 1, 7, 1, 0, 1, 0, datetime('now'), datetime('now')),
('Order of Service', 'order-of-service', 'Elegant order of service booklets for ceremonies.', 'Events Printing', 2, 7, 1, 0, 1, 0, datetime('now'), datetime('now')),
('Event Posters', 'event-posters', 'Eye-catching posters for events and celebrations.', 'Events Printing', 3, 7, 1, 0, 1, 0, datetime('now'), datetime('now')),
('Invitations', 'invitations', 'Beautiful invitations for weddings, parties, and special events.', 'Events Printing', 4, 7, 1, 0, 1, 0, datetime('now'), datetime('now')),
('Place Cards', 'place-cards', 'Personalized place cards for seating arrangements and events.', 'Events Printing', 5, 7, 1, 0, 1, 0, datetime('now'), datetime('now')),
('Thank You Cards', 'thank-you-cards', 'Custom thank you cards for expressing gratitude professionally.', 'Events Printing', 6, 7, 1, 0, 1, 0, datetime('now'), datetime('now'));

-- Insert Seasonal Printing services (categoryOrder = 8)
INSERT INTO Service (name, slug, description, category, "order", categoryOrder, isActive, configuratorEnabled, calculatorAvailable, clickCount, createdAt, updatedAt) VALUES
('Greetings Cards Printing', 'greetings-cards', 'Beautiful greeting cards for all occasions.', 'Seasonal Printing', 1, 8, 1, 0, 1, 0, datetime('now'), datetime('now')),
('Postcards', 'postcards', 'Custom postcards for travel and marketing.', 'Seasonal Printing', 2, 8, 1, 0, 1, 0, datetime('now'), datetime('now')),
('Wrapping Paper', 'wrapping-paper', 'Custom wrapping paper for gifts and packaging.', 'Seasonal Printing', 3, 8, 1, 0, 1, 0, datetime('now'), datetime('now')),
('Calendar', 'calendar', 'Custom calendars for businesses and personal use.', 'Seasonal Printing', 4, 8, 1, 0, 1, 0, datetime('now'), datetime('now'));

-- Insert Laminating services (categoryOrder = 9)
INSERT INTO Service (name, slug, description, category, "order", categoryOrder, isActive, configuratorEnabled, calculatorAvailable, clickCount, createdAt, updatedAt) VALUES
('A5-A1 Laminating', 'lamination', 'Professional laminating services from A5 to A1 size.', 'Laminating', 1, 9, 1, 0, 1, 0, datetime('now'), datetime('now'));

-- Insert Print Finishing Services (categoryOrder = 10)
INSERT INTO Service (name, slug, description, category, "order", categoryOrder, isActive, configuratorEnabled, calculatorAvailable, clickCount, createdAt, updatedAt) VALUES
('Binding', 'binding', 'Professional binding services for documents and booklets.', 'Print Finishing Services', 1, 10, 1, 0, 1, 0, datetime('now'), datetime('now')),
('Hole Punching', 'hole-punching', 'Precise hole punching for filing and organization.', 'Print Finishing Services', 2, 10, 1, 0, 1, 0, datetime('now'), datetime('now')),
('Perforating', 'perforating', 'Clean perforation lines for easy tearing.', 'Print Finishing Services', 3, 10, 1, 0, 1, 0, datetime('now'), datetime('now')),
('Rounding Corners', 'rounding-corners', 'Smooth rounded corners for professional finish.', 'Print Finishing Services', 4, 10, 1, 0, 1, 0, datetime('now'), datetime('now')),
('Glueing', 'glueing', 'Precise gluing services for various materials.', 'Print Finishing Services', 5, 10, 1, 0, 1, 0, datetime('now'), datetime('now')),
('Folding', 'folding', 'Professional folding services for brochures and leaflets.', 'Print Finishing Services', 6, 10, 1, 0, 1, 0, datetime('now'), datetime('now')),
('Stapling', 'stapling', 'Secure stapling services for documents and booklets.', 'Print Finishing Services', 7, 10, 1, 0, 1, 0, datetime('now'), datetime('now'));
