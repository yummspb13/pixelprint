PRAGMA foreign_keys=OFF;
BEGIN TRANSACTION;
CREATE TABLE IF NOT EXISTS "_prisma_migrations" (
    "id"                    TEXT PRIMARY KEY NOT NULL,
    "checksum"              TEXT NOT NULL,
    "finished_at"           DATETIME,
    "migration_name"        TEXT NOT NULL,
    "logs"                  TEXT,
    "rolled_back_at"        DATETIME,
    "started_at"            DATETIME NOT NULL DEFAULT current_timestamp,
    "applied_steps_count"   INTEGER UNSIGNED NOT NULL DEFAULT 0
);
INSERT INTO _prisma_migrations VALUES('bc4a0d0f-115f-4e92-8226-1e99957efd4a','d513533dfd841c5e7a0116f5bbfecfe7f4270356b75fdfc2f1a85e168aa3dc05',1758561786087,'20250922172306_init',NULL,NULL,1758561786079,1);
INSERT INTO _prisma_migrations VALUES('015d2919-8b3f-4851-92bd-eed06509f8b3','c54b8af9ebb5febf4ed48566f5f90358fe8871b4d0c6b1e3387c3ea255c7c12a',1758563055131,'20250922174415_add_search_logs',NULL,NULL,1758563055129,1);
CREATE TABLE IF NOT EXISTS "Service" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "image" TEXT,
    "category" TEXT NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0,
    "categoryOrder" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "configuratorEnabled" BOOLEAN NOT NULL DEFAULT false,
    "calculatorAvailable" BOOLEAN NOT NULL DEFAULT false,
    "clickCount" INTEGER NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO Service VALUES(180,'certificates','Certificates','Professional certificates in A4 and A5 sizes on 250gsm card',NULL,'Business Stationery',0,0,1,1,1,0,1758583252176,1758583252176);
INSERT INTO Service VALUES(181,'digital-business-cards','Digital Business Cards','Professional digital business cards in single sided and double sided options',NULL,'Business Stationery',0,0,1,1,1,0,1758584252290,1758584252290);
INSERT INTO Service VALUES(182,'appointment-cards','Appointment Cards','Professional appointment cards in black & white, color, and mixed options',NULL,'Business Stationery',0,0,1,1,1,0,1758584271470,1758584271470);
INSERT INTO Service VALUES(183,'letterheads','Letterheads','Professional letterheads in A4 and A5 sizes, black & white and color options',NULL,'Business Stationery',0,0,1,1,1,0,1758584375284,1758584375284);
INSERT INTO Service VALUES(184,'compliment-slips','Compliment Slips','Professional compliment slips in black & white and color options, single and double sided',NULL,'Business Stationery',0,0,1,1,1,0,1758584399256,1758584399256);
INSERT INTO Service VALUES(185,'loyalty-cards','Loyalty Cards','Professional loyalty cards in single sided and double sided options',NULL,'Business Stationery',0,0,1,1,1,0,1758584418448,1758584418448);
INSERT INTO Service VALUES(186,'overprint-envelopes','Overprint Envelopes','Professional overprint envelopes in single sided and double sided options',NULL,'Business Stationery',0,0,1,1,1,0,1758584436096,1758584436096);
INSERT INTO Service VALUES(189,'flyers','Flyers','Professional flyers in various sizes on 100gsm matte or 150gsm gloss paper',NULL,'Advertising',0,0,1,1,1,1,1758585109150,1758585150932);
INSERT INTO Service VALUES(190,'leaflets','Leaflets','Professional leaflets printing, BW on coloured paper on 150gsm gloss or 100gsm matt',NULL,'Advertising',0,0,1,1,1,1,1758585998812,1758586041126);
INSERT INTO Service VALUES(191,'posters','Posters','Professional posters in various sizes on 190gsm gloss, 170gsm gloss, or 90gsm paper',NULL,'Advertising',0,0,1,1,1,0,1758586553336,1758586553336);
INSERT INTO Service VALUES(192,'waterproof-menu','Waterproof Menu','Professional waterproof menus for restaurants and cafes',NULL,'Menu printing',0,0,1,0,0,0,1758587615745,1758587615745);
INSERT INTO Service VALUES(193,'placemat-menu','Placemat menu','Professional placemat menus for restaurants',NULL,'Menu printing',0,0,1,0,0,0,1758587615756,1758587615756);
INSERT INTO Service VALUES(194,'folded-restaurant-menu','Folded restaurant menu','Professional folded restaurant menus, booklet style with various page counts',NULL,'Menu printing',0,0,1,1,1,0,1758587615757,1758587615757);
INSERT INTO Service VALUES(195,'flat-restaurant-menu','Flat restaurant menu','Professional flat restaurant menus in color and black & white',NULL,'Menu printing',0,0,1,1,1,0,1758587615870,1758587615870);
INSERT INTO Service VALUES(196,'takeaway-menu','Takeaway Menu','Professional takeaway menus for restaurants and cafes',NULL,'Menu printing',0,0,1,1,1,0,1758587616075,1758587616075);
INSERT INTO Service VALUES(198,'booklets','Booklets','Professional booklets, programmes and fixture books in black & white and color',NULL,'Booklet printing',0,0,1,1,1,0,1758588527876,1758588527876);
INSERT INTO Service VALUES(199,'bw-photocopying','BW Photocopying','Professional black & white photocopying on 90gsm paper',NULL,'Photocopying',0,0,1,1,1,0,1758589021503,1758589021503);
INSERT INTO Service VALUES(200,'colour-photocopying','Colour Photocopying','Professional colour photocopying on 100gsm paper',NULL,'Photocopying',0,0,1,1,1,0,1758589021507,1758589021507);
INSERT INTO Service VALUES(201,'drawing-printing','Drawing Printing','Professional engineering drawings printing in A0, A1, A2 sizes, black & white and color',NULL,'Large Format Printing',0,0,1,1,1,0,1758589739662,1758589739662);
INSERT INTO Service VALUES(202,'poster-printing','Poster Printing','Professional poster printing in A0, A1, A2 sizes on 190gsm gloss paper',NULL,'Large Format Printing',0,0,1,1,1,0,1758589739671,1758589739671);
INSERT INTO Service VALUES(203,'wedding-stationery','Wedding Stationery','Professional wedding stationery including invitations, place cards, and order of service booklets',NULL,'Events Printing',0,0,1,1,1,0,1758589777800,1758589777800);
INSERT INTO Service VALUES(204,'invitations','Invitations','Professional invitations for birthdays, weddings, and special events',NULL,'Events Printing',0,0,1,1,1,0,1758589777804,1758589777804);
INSERT INTO Service VALUES(205,'order-of-service','Order of Service','Professional order of service booklets for weddings and ceremonies',NULL,'Events Printing',0,0,1,1,1,0,1758589777805,1758589777805);
INSERT INTO Service VALUES(206,'place-cards','Place Cards','Professional place cards for weddings and events',NULL,'Events Printing',0,0,1,1,1,0,1758589777807,1758589777807);
INSERT INTO Service VALUES(207,'bookmarks','Bookmarks','Professional bookmarks for events and promotions',NULL,'Events Printing',0,0,1,1,1,0,1758589777808,1758589777808);
INSERT INTO Service VALUES(208,'greetings-cards','Greetings Cards','Professional greeting cards in various sizes and formats for all occasions',NULL,'Seasonal Printing',0,0,1,1,1,0,1758589814337,1758589814337);
INSERT INTO Service VALUES(209,'postcards','Postcards','Professional postcards for travel and seasonal greetings',NULL,'Seasonal Printing',0,0,1,1,1,0,1758589814341,1758589814341);
INSERT INTO Service VALUES(210,'calendar','Calendar','Professional calendars in various sizes for businesses and personal use',NULL,'Seasonal Printing',0,0,1,1,1,0,1758589814342,1758589814342);
INSERT INTO Service VALUES(211,'wrapping-paper','Wrapping Paper','Professional wrapping paper for gifts and seasonal packaging',NULL,'Seasonal Printing',0,0,1,0,0,0,1758589814343,1758589814343);
INSERT INTO Service VALUES(213,'laminating','Laminating','Professional laminating services for A5 to A1 sizes',NULL,'Laminating',0,0,1,1,1,0,1758589862073,1758589862073);
INSERT INTO Service VALUES(214,'binding','Binding','Professional binding services for documents and booklets',NULL,'Print Finishing Services',0,0,1,1,1,0,1758589914190,1758589914190);
INSERT INTO Service VALUES(215,'stapling','Stapling','Professional stapling services for documents',NULL,'Print Finishing Services',0,0,1,1,1,0,1758589914194,1758589914194);
INSERT INTO Service VALUES(216,'folding','Folding','Professional folding services for documents and leaflets',NULL,'Print Finishing Services',0,0,1,1,1,0,1758589914195,1758589914195);
INSERT INTO Service VALUES(217,'gluing','Gluing','Professional gluing services for documents and booklets',NULL,'Print Finishing Services',0,0,1,1,1,0,1758589914196,1758589914196);
INSERT INTO Service VALUES(218,'perforating','Perforating','Professional perforating services for tear-off documents',NULL,'Print Finishing Services',0,0,1,1,1,0,1758589914198,1758589914198);
INSERT INTO Service VALUES(219,'hole-punching','Hole Punching','Professional hole punching services for ring binders',NULL,'Print Finishing Services',0,0,1,1,1,0,1758589914200,1758589914200);
INSERT INTO Service VALUES(220,'rounding-corners','Rounding Corners','Professional corner rounding services for cards and documents',NULL,'Print Finishing Services',0,0,1,1,1,0,1758589914202,1758589914202);
CREATE TABLE IF NOT EXISTS "PriceRow" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "serviceId" INTEGER NOT NULL,
    "attrs" JSONB NOT NULL,
    "ruleKind" TEXT NOT NULL,
    "unit" REAL,
    "setup" REAL,
    "fixed" REAL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "PriceRow_serviceId_fkey" FOREIGN KEY ("serviceId") REFERENCES "Service" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO PriceRow VALUES(188,180,'{"Sides":"Single Sided (S/S)","Color":"Color","Size":"A4"}','perUnit',NULL,NULL,NULL,1,1758583252179,1758583252179);
INSERT INTO PriceRow VALUES(189,180,'{"Sides":"Single Sided (S/S)","Color":"Color","Size":"A5"}','perUnit',NULL,NULL,NULL,1,1758583252186,1758583252186);
INSERT INTO PriceRow VALUES(190,181,'{"Sides":"Single Sided (S/S)","Color":"BW"}','perUnit',NULL,NULL,NULL,1,1758584252294,1758584252294);
INSERT INTO PriceRow VALUES(191,181,'{"Sides":"Double Sided (D/S)","Color":"BW"}','perUnit',NULL,NULL,NULL,1,1758584252305,1758584252305);
INSERT INTO PriceRow VALUES(192,182,'{"Sides":"Double Sided (D/S)","Color":"BW"}','perUnit',NULL,NULL,NULL,1,1758584271472,1758584271472);
INSERT INTO PriceRow VALUES(193,182,'{"Sides":"Double Sided (D/S)","Color":"Color"}','perUnit',NULL,NULL,NULL,1,1758584271480,1758584271480);
INSERT INTO PriceRow VALUES(194,182,'{"Sides":"Double Sided (D/S)","Color":"Color+BW"}','perUnit',NULL,NULL,NULL,1,1758584271486,1758584271486);
INSERT INTO PriceRow VALUES(195,183,'{"Sides":"Single Sided (S/S)","Color":"BW","Size":"A4"}','perUnit',NULL,NULL,NULL,1,1758584375287,1758584375287);
INSERT INTO PriceRow VALUES(196,183,'{"Sides":"Single Sided (S/S)","Color":"Color","Size":"A4"}','perUnit',NULL,NULL,NULL,1,1758584375295,1758584375295);
INSERT INTO PriceRow VALUES(197,183,'{"Sides":"Single Sided (S/S)","Color":"BW","Size":"A5"}','perUnit',NULL,NULL,NULL,1,1758584375307,1758584375307);
INSERT INTO PriceRow VALUES(198,184,'{"Sides":"Single Sided (S/S)","Color":"BW"}','perUnit',NULL,NULL,NULL,1,1758584399259,1758584399259);
INSERT INTO PriceRow VALUES(199,184,'{"Sides":"Single Sided (S/S)","Color":"Color"}','perUnit',NULL,NULL,NULL,1,1758584399268,1758584399268);
INSERT INTO PriceRow VALUES(200,184,'{"Sides":"Double Sided (D/S)","Color":"Color"}','perUnit',NULL,NULL,NULL,1,1758584399274,1758584399274);
INSERT INTO PriceRow VALUES(201,185,'{"Sides":"Single Sided (S/S)","Color":"BW"}','perUnit',NULL,NULL,NULL,1,1758584418451,1758584418451);
INSERT INTO PriceRow VALUES(202,185,'{"Sides":"Double Sided (D/S)","Color":"BW"}','perUnit',NULL,NULL,NULL,1,1758584418460,1758584418460);
INSERT INTO PriceRow VALUES(203,186,'{"Sides":"Single Sided (S/S)","Color":"BW"}','perUnit',NULL,NULL,NULL,1,1758584436099,1758584436099);
INSERT INTO PriceRow VALUES(204,186,'{"Sides":"Double Sided (D/S)","Color":"BW"}','perUnit',NULL,NULL,NULL,1,1758584436105,1758584436105);
INSERT INTO PriceRow VALUES(207,189,'{"Size":"A4","Sides":"Single Sided (S/S)","Paper":"100gsm Matte"}','perUnit',NULL,NULL,NULL,1,1758585109154,1758585109154);
INSERT INTO PriceRow VALUES(208,189,'{"Size":"A4","Sides":"Single Sided (S/S)","Paper":"150gsm Gloss"}','perUnit',NULL,NULL,NULL,1,1758585109159,1758585109159);
INSERT INTO PriceRow VALUES(209,189,'{"Size":"A4","Sides":"Double Sided (D/S)","Paper":"100gsm Matte"}','perUnit',NULL,NULL,NULL,1,1758585109192,1758585109192);
INSERT INTO PriceRow VALUES(210,189,'{"Size":"A4","Sides":"Double Sided (D/S)","Paper":"150gsm Gloss"}','perUnit',NULL,NULL,NULL,1,1758585109195,1758585109195);
INSERT INTO PriceRow VALUES(211,189,'{"Size":"A5","Sides":"Single Sided (S/S)","Paper":"100gsm Matte"}','perUnit',NULL,NULL,NULL,1,1758585109221,1758585109221);
INSERT INTO PriceRow VALUES(212,189,'{"Size":"A5","Sides":"Single Sided (S/S)","Paper":"150gsm Gloss"}','perUnit',NULL,NULL,NULL,1,1758585109223,1758585109223);
INSERT INTO PriceRow VALUES(213,189,'{"Size":"A5","Sides":"Double Sided (D/S)","Paper":"100gsm Matte"}','perUnit',NULL,NULL,NULL,1,1758585109255,1758585109255);
INSERT INTO PriceRow VALUES(214,189,'{"Size":"A5","Sides":"Double Sided (D/S)","Paper":"150gsm Gloss"}','perUnit',NULL,NULL,NULL,1,1758585109257,1758585109257);
INSERT INTO PriceRow VALUES(215,189,'{"Size":"DL","Sides":"Single Sided (S/S)","Paper":"100gsm Matte"}','perUnit',NULL,NULL,NULL,1,1758585109287,1758585109287);
INSERT INTO PriceRow VALUES(216,189,'{"Size":"DL","Sides":"Single Sided (S/S)","Paper":"150gsm Gloss"}','perUnit',NULL,NULL,NULL,1,1758585109289,1758585109289);
INSERT INTO PriceRow VALUES(217,189,'{"Size":"DL","Sides":"Double Sided (D/S)","Paper":"100gsm Matte"}','perUnit',NULL,NULL,NULL,1,1758585109318,1758585109318);
INSERT INTO PriceRow VALUES(218,189,'{"Size":"DL","Sides":"Double Sided (D/S)","Paper":"150gsm Gloss"}','perUnit',NULL,NULL,NULL,1,1758585109320,1758585109320);
INSERT INTO PriceRow VALUES(219,189,'{"Size":"A6","Sides":"Single Sided (S/S)","Paper":"100gsm Matte"}','perUnit',NULL,NULL,NULL,1,1758585109349,1758585109349);
INSERT INTO PriceRow VALUES(220,189,'{"Size":"A6","Sides":"Single Sided (S/S)","Paper":"150gsm Gloss"}','perUnit',NULL,NULL,NULL,1,1758585109352,1758585109352);
INSERT INTO PriceRow VALUES(221,189,'{"Size":"A6","Sides":"Double Sided (D/S)","Paper":"100gsm Matte"}','perUnit',NULL,NULL,NULL,1,1758585109371,1758585109371);
INSERT INTO PriceRow VALUES(222,189,'{"Size":"A6","Sides":"Double Sided (D/S)","Paper":"150gsm Gloss"}','perUnit',NULL,NULL,NULL,1,1758585109373,1758585109373);
INSERT INTO PriceRow VALUES(223,190,'{"Size":"A4","Sides":"Single Sided (S/S)","Paper":"100gsm Matt"}','perUnit',NULL,NULL,NULL,1,1758585998822,1758585998822);
INSERT INTO PriceRow VALUES(224,190,'{"Size":"A4","Sides":"Single Sided (S/S)","Paper":"150gsm Gloss"}','perUnit',NULL,NULL,NULL,1,1758585998827,1758585998827);
INSERT INTO PriceRow VALUES(225,190,'{"Size":"A4","Sides":"Double Sided (D/S)","Paper":"100gsm Matt"}','perUnit',NULL,NULL,NULL,1,1758585998859,1758585998859);
INSERT INTO PriceRow VALUES(226,190,'{"Size":"A4","Sides":"Double Sided (D/S)","Paper":"150gsm Gloss"}','perUnit',NULL,NULL,NULL,1,1758585998861,1758585998861);
INSERT INTO PriceRow VALUES(227,190,'{"Size":"A5","Sides":"Single Sided (S/S)","Paper":"100gsm Matt"}','perUnit',NULL,NULL,NULL,1,1758585998891,1758585998891);
INSERT INTO PriceRow VALUES(228,190,'{"Size":"A5","Sides":"Single Sided (S/S)","Paper":"150gsm Gloss"}','perUnit',NULL,NULL,NULL,1,1758585998893,1758585998893);
INSERT INTO PriceRow VALUES(229,190,'{"Size":"A5","Sides":"Double Sided (D/S)","Paper":"100gsm Matt"}','perUnit',NULL,NULL,NULL,1,1758585998922,1758585998922);
INSERT INTO PriceRow VALUES(230,190,'{"Size":"A5","Sides":"Double Sided (D/S)","Paper":"150gsm Gloss"}','perUnit',NULL,NULL,NULL,1,1758585998925,1758585998925);
INSERT INTO PriceRow VALUES(231,190,'{"Size":"DL","Sides":"Single Sided (S/S)","Paper":"100gsm Matt"}','perUnit',NULL,NULL,NULL,1,1758585998954,1758585998954);
INSERT INTO PriceRow VALUES(232,190,'{"Size":"DL","Sides":"Single Sided (S/S)","Paper":"150gsm Gloss"}','perUnit',NULL,NULL,NULL,1,1758585998956,1758585998956);
INSERT INTO PriceRow VALUES(233,190,'{"Size":"DL","Sides":"Double Sided (D/S)","Paper":"100gsm Matt"}','perUnit',NULL,NULL,NULL,1,1758585998982,1758585998982);
INSERT INTO PriceRow VALUES(234,190,'{"Size":"DL","Sides":"Double Sided (D/S)","Paper":"150gsm Gloss"}','perUnit',NULL,NULL,NULL,1,1758585998985,1758585998985);
INSERT INTO PriceRow VALUES(235,190,'{"Size":"A6","Sides":"Single Sided (S/S)","Paper":"100gsm Matt"}','perUnit',NULL,NULL,NULL,1,1758585999012,1758585999012);
INSERT INTO PriceRow VALUES(236,190,'{"Size":"A6","Sides":"Single Sided (S/S)","Paper":"150gsm Gloss"}','perUnit',NULL,NULL,NULL,1,1758585999014,1758585999014);
INSERT INTO PriceRow VALUES(237,190,'{"Size":"A6","Sides":"Double Sided (D/S)","Paper":"100gsm Matt"}','perUnit',NULL,NULL,NULL,1,1758585999030,1758585999030);
INSERT INTO PriceRow VALUES(238,190,'{"Size":"A6","Sides":"Double Sided (D/S)","Paper":"150gsm Gloss"}','perUnit',NULL,NULL,NULL,1,1758585999033,1758585999033);
INSERT INTO PriceRow VALUES(239,191,'{"Size":"A0","Paper":"190gsm Gloss"}','perUnit',NULL,NULL,NULL,1,1758586553341,1758586553341);
INSERT INTO PriceRow VALUES(240,191,'{"Size":"A1","Paper":"190gsm Gloss"}','perUnit',NULL,NULL,NULL,1,1758586553351,1758586553351);
INSERT INTO PriceRow VALUES(241,191,'{"Size":"A2","Paper":"190gsm Gloss"}','perUnit',NULL,NULL,NULL,1,1758586553358,1758586553358);
INSERT INTO PriceRow VALUES(242,191,'{"Size":"A3","Paper":"190gsm Gloss"}','perUnit',NULL,NULL,NULL,1,1758586553367,1758586553367);
INSERT INTO PriceRow VALUES(243,191,'{"Size":"A0","Paper":"170gsm Gloss"}','fixed',NULL,NULL,NULL,1,1758586553372,1758586553372);
INSERT INTO PriceRow VALUES(244,191,'{"Size":"A1","Paper":"170gsm Gloss"}','fixed',NULL,NULL,NULL,1,1758586553377,1758586553377);
INSERT INTO PriceRow VALUES(245,191,'{"Size":"A2","Paper":"170gsm Gloss"}','fixed',NULL,NULL,NULL,1,1758586553382,1758586553382);
INSERT INTO PriceRow VALUES(246,191,'{"Size":"A3","Paper":"170gsm Gloss"}','fixed',NULL,NULL,NULL,1,1758586553387,1758586553387);
INSERT INTO PriceRow VALUES(247,191,'{"Size":"A0","Paper":"90gsm Paper"}','fixed',NULL,NULL,NULL,1,1758586553392,1758586553392);
INSERT INTO PriceRow VALUES(248,191,'{"Size":"A1","Paper":"90gsm Paper"}','fixed',NULL,NULL,NULL,1,1758586553398,1758586553398);
INSERT INTO PriceRow VALUES(249,191,'{"Size":"A2","Paper":"90gsm Paper"}','fixed',NULL,NULL,NULL,1,1758586553404,1758586553404);
INSERT INTO PriceRow VALUES(250,191,'{"Size":"A3","Paper":"90gsm Paper"}','fixed',NULL,NULL,NULL,1,1758586553409,1758586553409);
INSERT INTO PriceRow VALUES(251,194,'{"Size":"A4","Pages":"4pp","Paper":"90gsm paper"}','perUnit',NULL,NULL,NULL,1,1758587615758,1758587615758);
INSERT INTO PriceRow VALUES(252,194,'{"Size":"A4","Pages":"4pp","Paper":"150gsm gloss"}','perUnit',NULL,NULL,NULL,1,1758587615767,1758587615767);
INSERT INTO PriceRow VALUES(253,194,'{"Size":"A4","Pages":"4pp","Paper":"350gsm card"}','perUnit',NULL,NULL,NULL,1,1758587615775,1758587615775);
INSERT INTO PriceRow VALUES(254,194,'{"Size":"A4","Pages":"4pp","Paper":"270 micron"}','perUnit',NULL,NULL,NULL,1,1758587615780,1758587615780);
INSERT INTO PriceRow VALUES(255,194,'{"Size":"A4","Pages":"8pp","Paper":"90gsm paper"}','perUnit',NULL,NULL,NULL,1,1758587615784,1758587615784);
INSERT INTO PriceRow VALUES(256,194,'{"Size":"A4","Pages":"8pp","Paper":"150gsm gloss"}','perUnit',NULL,NULL,NULL,1,1758587615789,1758587615789);
INSERT INTO PriceRow VALUES(257,194,'{"Size":"A4","Pages":"8pp","Paper":"350gsm card"}','perUnit',NULL,NULL,NULL,1,1758587615793,1758587615793);
INSERT INTO PriceRow VALUES(258,194,'{"Size":"A4","Pages":"8pp","Paper":"270 micron"}','perUnit',NULL,NULL,NULL,1,1758587615797,1758587615797);
INSERT INTO PriceRow VALUES(259,194,'{"Size":"A4","Pages":"12pp","Paper":"90gsm paper"}','perUnit',NULL,NULL,NULL,1,1758587615801,1758587615801);
INSERT INTO PriceRow VALUES(260,194,'{"Size":"A4","Pages":"12pp","Paper":"150gsm gloss"}','perUnit',NULL,NULL,NULL,1,1758587615805,1758587615805);
INSERT INTO PriceRow VALUES(261,194,'{"Size":"A4","Pages":"12pp","Paper":"350gsm card"}','perUnit',NULL,NULL,NULL,1,1758587615810,1758587615810);
INSERT INTO PriceRow VALUES(262,194,'{"Size":"A4","Pages":"12pp","Paper":"270 micron"}','perUnit',NULL,NULL,NULL,1,1758587615814,1758587615814);
INSERT INTO PriceRow VALUES(263,194,'{"Size":"A5","Pages":"4pp","Paper":"90gsm paper"}','perUnit',NULL,NULL,NULL,1,1758587615818,1758587615818);
INSERT INTO PriceRow VALUES(264,194,'{"Size":"A5","Pages":"4pp","Paper":"150gsm gloss"}','perUnit',NULL,NULL,NULL,1,1758587615822,1758587615822);
INSERT INTO PriceRow VALUES(265,194,'{"Size":"A5","Pages":"4pp","Paper":"350gsm card"}','perUnit',NULL,NULL,NULL,1,1758587615826,1758587615826);
INSERT INTO PriceRow VALUES(266,194,'{"Size":"A5","Pages":"4pp","Paper":"270 micron"}','perUnit',NULL,NULL,NULL,1,1758587615830,1758587615830);
INSERT INTO PriceRow VALUES(267,194,'{"Size":"A5","Pages":"8pp","Paper":"90gsm paper"}','perUnit',NULL,NULL,NULL,1,1758587615835,1758587615835);
INSERT INTO PriceRow VALUES(268,194,'{"Size":"A5","Pages":"8pp","Paper":"150gsm gloss"}','perUnit',NULL,NULL,NULL,1,1758587615839,1758587615839);
INSERT INTO PriceRow VALUES(269,194,'{"Size":"A5","Pages":"8pp","Paper":"350gsm card"}','perUnit',NULL,NULL,NULL,1,1758587615844,1758587615844);
INSERT INTO PriceRow VALUES(270,194,'{"Size":"A5","Pages":"8pp","Paper":"270 micron"}','perUnit',NULL,NULL,NULL,1,1758587615848,1758587615848);
INSERT INTO PriceRow VALUES(271,194,'{"Size":"A5","Pages":"12pp","Paper":"90gsm paper"}','perUnit',NULL,NULL,NULL,1,1758587615852,1758587615852);
INSERT INTO PriceRow VALUES(272,194,'{"Size":"A5","Pages":"12pp","Paper":"150gsm gloss"}','perUnit',NULL,NULL,NULL,1,1758587615856,1758587615856);
INSERT INTO PriceRow VALUES(273,194,'{"Size":"A5","Pages":"12pp","Paper":"350gsm card"}','perUnit',NULL,NULL,NULL,1,1758587615860,1758587615860);
INSERT INTO PriceRow VALUES(274,194,'{"Size":"A5","Pages":"12pp","Paper":"270 micron"}','perUnit',NULL,NULL,NULL,1,1758587615865,1758587615865);
INSERT INTO PriceRow VALUES(275,195,'{"Size":"A5","Sides":"S/S","Color":"Color","Paper":"90gsm paper"}','perUnit',NULL,NULL,NULL,1,1758587615871,1758587615871);
INSERT INTO PriceRow VALUES(276,195,'{"Size":"A5","Sides":"S/S","Color":"Color","Paper":"150gsm gloss"}','perUnit',NULL,NULL,NULL,1,1758587615876,1758587615876);
INSERT INTO PriceRow VALUES(277,195,'{"Size":"A5","Sides":"S/S","Color":"Color","Paper":"350gsm card"}','perUnit',NULL,NULL,NULL,1,1758587615880,1758587615880);
INSERT INTO PriceRow VALUES(278,195,'{"Size":"A5","Sides":"S/S","Color":"Color","Paper":"270 micron"}','perUnit',NULL,NULL,NULL,1,1758587615884,1758587615884);
INSERT INTO PriceRow VALUES(279,195,'{"Size":"A5","Sides":"D/S","Color":"Color","Paper":"90gsm paper"}','perUnit',NULL,NULL,NULL,1,1758587615888,1758587615888);
INSERT INTO PriceRow VALUES(280,195,'{"Size":"A5","Sides":"D/S","Color":"Color","Paper":"150gsm gloss"}','perUnit',NULL,NULL,NULL,1,1758587615892,1758587615892);
INSERT INTO PriceRow VALUES(281,195,'{"Size":"A5","Sides":"D/S","Color":"Color","Paper":"350gsm card"}','perUnit',NULL,NULL,NULL,1,1758587615897,1758587615897);
INSERT INTO PriceRow VALUES(282,195,'{"Size":"A5","Sides":"D/S","Color":"Color","Paper":"270 micron"}','perUnit',NULL,NULL,NULL,1,1758587615901,1758587615901);
INSERT INTO PriceRow VALUES(283,195,'{"Size":"A4","Sides":"S/S","Color":"Color","Paper":"90gsm paper"}','perUnit',NULL,NULL,NULL,1,1758587615905,1758587615905);
INSERT INTO PriceRow VALUES(284,195,'{"Size":"A4","Sides":"S/S","Color":"Color","Paper":"150gsm gloss"}','perUnit',NULL,NULL,NULL,1,1758587615909,1758587615909);
INSERT INTO PriceRow VALUES(285,195,'{"Size":"A4","Sides":"S/S","Color":"Color","Paper":"350gsm card"}','perUnit',NULL,NULL,NULL,1,1758587615913,1758587615913);
INSERT INTO PriceRow VALUES(286,195,'{"Size":"A4","Sides":"S/S","Color":"Color","Paper":"270 micron"}','perUnit',NULL,NULL,NULL,1,1758587615917,1758587615917);
INSERT INTO PriceRow VALUES(287,195,'{"Size":"A4","Sides":"D/S","Color":"Color","Paper":"90gsm paper"}','perUnit',NULL,NULL,NULL,1,1758587615921,1758587615921);
INSERT INTO PriceRow VALUES(288,195,'{"Size":"A4","Sides":"D/S","Color":"Color","Paper":"150gsm gloss"}','perUnit',NULL,NULL,NULL,1,1758587615926,1758587615926);
INSERT INTO PriceRow VALUES(289,195,'{"Size":"A4","Sides":"D/S","Color":"Color","Paper":"350gsm card"}','perUnit',NULL,NULL,NULL,1,1758587615929,1758587615929);
INSERT INTO PriceRow VALUES(290,195,'{"Size":"A4","Sides":"D/S","Color":"Color","Paper":"270 micron"}','perUnit',NULL,NULL,NULL,1,1758587615934,1758587615934);
INSERT INTO PriceRow VALUES(291,195,'{"Size":"A3","Sides":"S/S","Color":"Color","Paper":"90gsm paper"}','perUnit',NULL,NULL,NULL,1,1758587615938,1758587615938);
INSERT INTO PriceRow VALUES(292,195,'{"Size":"A3","Sides":"S/S","Color":"Color","Paper":"150gsm gloss"}','perUnit',NULL,NULL,NULL,1,1758587615942,1758587615942);
INSERT INTO PriceRow VALUES(293,195,'{"Size":"A3","Sides":"S/S","Color":"Color","Paper":"350gsm card"}','perUnit',NULL,NULL,NULL,1,1758587615947,1758587615947);
INSERT INTO PriceRow VALUES(294,195,'{"Size":"A3","Sides":"S/S","Color":"Color","Paper":"270 micron"}','perUnit',NULL,NULL,NULL,1,1758587615951,1758587615951);
INSERT INTO PriceRow VALUES(295,195,'{"Size":"A3","Sides":"D/S","Color":"Color","Paper":"90gsm paper"}','perUnit',NULL,NULL,NULL,1,1758587615956,1758587615956);
INSERT INTO PriceRow VALUES(296,195,'{"Size":"A3","Sides":"D/S","Color":"Color","Paper":"150gsm gloss"}','perUnit',NULL,NULL,NULL,1,1758587615961,1758587615961);
INSERT INTO PriceRow VALUES(297,195,'{"Size":"A3","Sides":"D/S","Color":"Color","Paper":"350gsm card"}','perUnit',NULL,NULL,NULL,1,1758587615966,1758587615966);
INSERT INTO PriceRow VALUES(298,195,'{"Size":"A3","Sides":"D/S","Color":"Color","Paper":"270 micron"}','perUnit',NULL,NULL,NULL,1,1758587615971,1758587615971);
INSERT INTO PriceRow VALUES(299,195,'{"Size":"A5","Sides":"S/S","Color":"BW","Paper":"90gsm paper"}','perUnit',NULL,NULL,NULL,1,1758587615975,1758587615975);
INSERT INTO PriceRow VALUES(300,195,'{"Size":"A5","Sides":"S/S","Color":"BW","Paper":"150gsm gloss"}','perUnit',NULL,NULL,NULL,1,1758587615980,1758587615980);
INSERT INTO PriceRow VALUES(301,195,'{"Size":"A5","Sides":"S/S","Color":"BW","Paper":"350gsm card"}','perUnit',NULL,NULL,NULL,1,1758587615984,1758587615984);
INSERT INTO PriceRow VALUES(302,195,'{"Size":"A5","Sides":"S/S","Color":"BW","Paper":"270 micron"}','perUnit',NULL,NULL,NULL,1,1758587615988,1758587615988);
INSERT INTO PriceRow VALUES(303,195,'{"Size":"A5","Sides":"D/S","Color":"BW","Paper":"90gsm paper"}','perUnit',NULL,NULL,NULL,1,1758587615993,1758587615993);
INSERT INTO PriceRow VALUES(304,195,'{"Size":"A5","Sides":"D/S","Color":"BW","Paper":"150gsm gloss"}','perUnit',NULL,NULL,NULL,1,1758587615997,1758587615997);
INSERT INTO PriceRow VALUES(305,195,'{"Size":"A5","Sides":"D/S","Color":"BW","Paper":"350gsm card"}','perUnit',NULL,NULL,NULL,1,1758587616001,1758587616001);
INSERT INTO PriceRow VALUES(306,195,'{"Size":"A5","Sides":"D/S","Color":"BW","Paper":"270 micron"}','perUnit',NULL,NULL,NULL,1,1758587616006,1758587616006);
INSERT INTO PriceRow VALUES(307,195,'{"Size":"A4","Sides":"S/S","Color":"BW","Paper":"90gsm paper"}','perUnit',NULL,NULL,NULL,1,1758587616010,1758587616010);
INSERT INTO PriceRow VALUES(308,195,'{"Size":"A4","Sides":"S/S","Color":"BW","Paper":"150gsm gloss"}','perUnit',NULL,NULL,NULL,1,1758587616014,1758587616014);
INSERT INTO PriceRow VALUES(309,195,'{"Size":"A4","Sides":"S/S","Color":"BW","Paper":"350gsm card"}','perUnit',NULL,NULL,NULL,1,1758587616018,1758587616018);
INSERT INTO PriceRow VALUES(310,195,'{"Size":"A4","Sides":"S/S","Color":"BW","Paper":"270 micron"}','perUnit',NULL,NULL,NULL,1,1758587616022,1758587616022);
INSERT INTO PriceRow VALUES(311,195,'{"Size":"A4","Sides":"D/S","Color":"BW","Paper":"90gsm paper"}','perUnit',NULL,NULL,NULL,1,1758587616026,1758587616026);
INSERT INTO PriceRow VALUES(312,195,'{"Size":"A4","Sides":"D/S","Color":"BW","Paper":"150gsm gloss"}','perUnit',NULL,NULL,NULL,1,1758587616030,1758587616030);
INSERT INTO PriceRow VALUES(313,195,'{"Size":"A4","Sides":"D/S","Color":"BW","Paper":"350gsm card"}','perUnit',NULL,NULL,NULL,1,1758587616034,1758587616034);
INSERT INTO PriceRow VALUES(314,195,'{"Size":"A4","Sides":"D/S","Color":"BW","Paper":"270 micron"}','perUnit',NULL,NULL,NULL,1,1758587616038,1758587616038);
INSERT INTO PriceRow VALUES(315,195,'{"Size":"A3","Sides":"S/S","Color":"BW","Paper":"90gsm paper"}','perUnit',NULL,NULL,NULL,1,1758587616042,1758587616042);
INSERT INTO PriceRow VALUES(316,195,'{"Size":"A3","Sides":"S/S","Color":"BW","Paper":"150gsm gloss"}','perUnit',NULL,NULL,NULL,1,1758587616046,1758587616046);
INSERT INTO PriceRow VALUES(317,195,'{"Size":"A3","Sides":"S/S","Color":"BW","Paper":"350gsm card"}','perUnit',NULL,NULL,NULL,1,1758587616051,1758587616051);
INSERT INTO PriceRow VALUES(318,195,'{"Size":"A3","Sides":"S/S","Color":"BW","Paper":"270 micron"}','perUnit',NULL,NULL,NULL,1,1758587616055,1758587616055);
INSERT INTO PriceRow VALUES(319,195,'{"Size":"A3","Sides":"D/S","Color":"BW","Paper":"90gsm paper"}','perUnit',NULL,NULL,NULL,1,1758587616059,1758587616059);
INSERT INTO PriceRow VALUES(320,195,'{"Size":"A3","Sides":"D/S","Color":"BW","Paper":"150gsm gloss"}','perUnit',NULL,NULL,NULL,1,1758587616063,1758587616063);
INSERT INTO PriceRow VALUES(321,195,'{"Size":"A3","Sides":"D/S","Color":"BW","Paper":"350gsm card"}','perUnit',NULL,NULL,NULL,1,1758587616067,1758587616067);
INSERT INTO PriceRow VALUES(322,195,'{"Size":"A3","Sides":"D/S","Color":"BW","Paper":"270 micron"}','perUnit',NULL,NULL,NULL,1,1758587616071,1758587616071);
INSERT INTO PriceRow VALUES(323,196,'{"Size":"A5","Sides":"D/S","Color":"Color","Paper":"100gsm/150gsm gloss"}','fixed',NULL,NULL,NULL,1,1758587616076,1758587616076);
INSERT INTO PriceRow VALUES(324,196,'{"Size":"A5 (A4 folded)","Sides":"D/S","Color":"Color","Paper":"100gsm/150gsm gloss"}','fixed',NULL,NULL,NULL,1,1758587616080,1758587616080);
INSERT INTO PriceRow VALUES(325,196,'{"Size":"DL (A4 Z-folded)","Sides":"D/S","Color":"Color","Paper":"100gsm/150gsm gloss"}','fixed',NULL,NULL,NULL,1,1758587616084,1758587616084);
INSERT INTO PriceRow VALUES(326,196,'{"Size":"A5 (A4 folded)","Sides":"D/S","Color":"BW","Paper":"100gsm/150gsm gloss"}','fixed',NULL,NULL,NULL,1,1758587616088,1758587616088);
INSERT INTO PriceRow VALUES(327,196,'{"Size":"DL (A4 Z-folded)","Sides":"D/S","Color":"BW","Paper":"100gsm/150gsm gloss"}','fixed',NULL,NULL,NULL,1,1758587616092,1758587616092);
INSERT INTO PriceRow VALUES(328,198,'{"Size":"A4","Pages":"8pp","Color":"BW"}','perUnit',NULL,NULL,NULL,1,1758588527880,1758588527880);
INSERT INTO PriceRow VALUES(329,198,'{"Size":"A4","Pages":"12pp","Color":"BW"}','perUnit',NULL,NULL,NULL,1,1758588527884,1758588527884);
INSERT INTO PriceRow VALUES(330,198,'{"Size":"A4","Pages":"16pp","Color":"BW"}','perUnit',NULL,NULL,NULL,1,1758588527888,1758588527888);
INSERT INTO PriceRow VALUES(331,198,'{"Size":"A4","Pages":"20pp","Color":"BW"}','perUnit',NULL,NULL,NULL,1,1758588527891,1758588527891);
INSERT INTO PriceRow VALUES(332,198,'{"Size":"A4","Pages":"24pp","Color":"BW"}','perUnit',NULL,NULL,NULL,1,1758588527893,1758588527893);
INSERT INTO PriceRow VALUES(333,198,'{"Size":"A4","Pages":"28pp","Color":"BW"}','perUnit',NULL,NULL,NULL,1,1758588527895,1758588527895);
INSERT INTO PriceRow VALUES(334,198,'{"Size":"A4","Pages":"32pp","Color":"BW"}','perUnit',NULL,NULL,NULL,1,1758588527897,1758588527897);
INSERT INTO PriceRow VALUES(335,198,'{"Size":"A4","Pages":"36pp","Color":"BW"}','perUnit',NULL,NULL,NULL,1,1758588527900,1758588527900);
INSERT INTO PriceRow VALUES(336,198,'{"Size":"A4","Pages":"40pp","Color":"BW"}','perUnit',NULL,NULL,NULL,1,1758588527902,1758588527902);
INSERT INTO PriceRow VALUES(337,198,'{"Size":"A4","Pages":"44pp","Color":"BW"}','perUnit',NULL,NULL,NULL,1,1758588527904,1758588527904);
INSERT INTO PriceRow VALUES(338,198,'{"Size":"A4","Pages":"48pp","Color":"BW"}','perUnit',NULL,NULL,NULL,1,1758588527906,1758588527906);
INSERT INTO PriceRow VALUES(339,198,'{"Size":"A4","Pages":"52pp","Color":"BW"}','perUnit',NULL,NULL,NULL,1,1758588527908,1758588527908);
INSERT INTO PriceRow VALUES(340,198,'{"Size":"A4","Pages":"56pp","Color":"BW"}','perUnit',NULL,NULL,NULL,1,1758588527911,1758588527911);
INSERT INTO PriceRow VALUES(341,198,'{"Size":"A4","Pages":"60pp","Color":"BW"}','perUnit',NULL,NULL,NULL,1,1758588527913,1758588527913);
INSERT INTO PriceRow VALUES(342,198,'{"Size":"A4","Pages":"64pp","Color":"BW"}','perUnit',NULL,NULL,NULL,1,1758588527916,1758588527916);
INSERT INTO PriceRow VALUES(343,198,'{"Size":"A4","Pages":"68pp","Color":"BW"}','perUnit',NULL,NULL,NULL,1,1758588527918,1758588527918);
INSERT INTO PriceRow VALUES(344,198,'{"Size":"A5","Pages":"8pp","Color":"BW"}','perUnit',NULL,NULL,NULL,1,1758588527921,1758588527921);
INSERT INTO PriceRow VALUES(345,198,'{"Size":"A5","Pages":"12pp","Color":"BW"}','perUnit',NULL,NULL,NULL,1,1758588527923,1758588527923);
INSERT INTO PriceRow VALUES(346,198,'{"Size":"A5","Pages":"16pp","Color":"BW"}','perUnit',NULL,NULL,NULL,1,1758588527925,1758588527925);
INSERT INTO PriceRow VALUES(347,198,'{"Size":"A5","Pages":"20pp","Color":"BW"}','perUnit',NULL,NULL,NULL,1,1758588527928,1758588527928);
INSERT INTO PriceRow VALUES(348,198,'{"Size":"A5","Pages":"24pp","Color":"BW"}','perUnit',NULL,NULL,NULL,1,1758588527931,1758588527931);
INSERT INTO PriceRow VALUES(349,198,'{"Size":"A5","Pages":"28pp","Color":"BW"}','perUnit',NULL,NULL,NULL,1,1758588527933,1758588527933);
INSERT INTO PriceRow VALUES(350,198,'{"Size":"A5","Pages":"32pp","Color":"BW"}','perUnit',NULL,NULL,NULL,1,1758588527936,1758588527936);
INSERT INTO PriceRow VALUES(351,198,'{"Size":"A5","Pages":"36pp","Color":"BW"}','perUnit',NULL,NULL,NULL,1,1758588527938,1758588527938);
INSERT INTO PriceRow VALUES(352,198,'{"Size":"A5","Pages":"40pp","Color":"BW"}','perUnit',NULL,NULL,NULL,1,1758588527940,1758588527940);
INSERT INTO PriceRow VALUES(353,198,'{"Size":"A5","Pages":"44pp","Color":"BW"}','perUnit',NULL,NULL,NULL,1,1758588527942,1758588527942);
INSERT INTO PriceRow VALUES(354,198,'{"Size":"A5","Pages":"48pp","Color":"BW"}','perUnit',NULL,NULL,NULL,1,1758588527944,1758588527944);
INSERT INTO PriceRow VALUES(355,198,'{"Size":"A5","Pages":"52pp","Color":"BW"}','perUnit',NULL,NULL,NULL,1,1758588527946,1758588527946);
INSERT INTO PriceRow VALUES(356,198,'{"Size":"A5","Pages":"56pp","Color":"BW"}','perUnit',NULL,NULL,NULL,1,1758588527948,1758588527948);
INSERT INTO PriceRow VALUES(357,198,'{"Size":"A5","Pages":"60pp","Color":"BW"}','perUnit',NULL,NULL,NULL,1,1758588527950,1758588527950);
INSERT INTO PriceRow VALUES(358,198,'{"Size":"A5","Pages":"64pp","Color":"BW"}','perUnit',NULL,NULL,NULL,1,1758588527952,1758588527952);
INSERT INTO PriceRow VALUES(359,198,'{"Size":"A5","Pages":"68pp","Color":"BW"}','perUnit',NULL,NULL,NULL,1,1758588527955,1758588527955);
INSERT INTO PriceRow VALUES(360,198,'{"Size":"A6","Pages":"8pp","Color":"BW"}','perUnit',NULL,NULL,NULL,1,1758588527957,1758588527957);
INSERT INTO PriceRow VALUES(361,198,'{"Size":"A6","Pages":"12pp","Color":"BW"}','perUnit',NULL,NULL,NULL,1,1758588527959,1758588527959);
INSERT INTO PriceRow VALUES(362,198,'{"Size":"A6","Pages":"16pp","Color":"BW"}','perUnit',NULL,NULL,NULL,1,1758588527961,1758588527961);
INSERT INTO PriceRow VALUES(363,198,'{"Size":"A6","Pages":"20pp","Color":"BW"}','perUnit',NULL,NULL,NULL,1,1758588527963,1758588527963);
INSERT INTO PriceRow VALUES(364,198,'{"Size":"A6","Pages":"24pp","Color":"BW"}','perUnit',NULL,NULL,NULL,1,1758588527966,1758588527966);
INSERT INTO PriceRow VALUES(365,198,'{"Size":"A6","Pages":"28pp","Color":"BW"}','perUnit',NULL,NULL,NULL,1,1758588527968,1758588527968);
INSERT INTO PriceRow VALUES(366,198,'{"Size":"A6","Pages":"32pp","Color":"BW"}','perUnit',NULL,NULL,NULL,1,1758588527970,1758588527970);
INSERT INTO PriceRow VALUES(367,198,'{"Size":"A6","Pages":"36pp","Color":"BW"}','perUnit',NULL,NULL,NULL,1,1758588527972,1758588527972);
INSERT INTO PriceRow VALUES(368,198,'{"Size":"A6","Pages":"40pp","Color":"BW"}','perUnit',NULL,NULL,NULL,1,1758588527974,1758588527974);
INSERT INTO PriceRow VALUES(369,198,'{"Size":"A6","Pages":"44pp","Color":"BW"}','perUnit',NULL,NULL,NULL,1,1758588527976,1758588527976);
INSERT INTO PriceRow VALUES(370,198,'{"Size":"A6","Pages":"48pp","Color":"BW"}','perUnit',NULL,NULL,NULL,1,1758588527978,1758588527978);
INSERT INTO PriceRow VALUES(371,198,'{"Size":"A6","Pages":"52pp","Color":"BW"}','perUnit',NULL,NULL,NULL,1,1758588527980,1758588527980);
INSERT INTO PriceRow VALUES(372,198,'{"Size":"A6","Pages":"56pp","Color":"BW"}','perUnit',NULL,NULL,NULL,1,1758588527982,1758588527982);
INSERT INTO PriceRow VALUES(373,198,'{"Size":"A6","Pages":"60pp","Color":"BW"}','perUnit',NULL,NULL,NULL,1,1758588527984,1758588527984);
INSERT INTO PriceRow VALUES(374,198,'{"Size":"A4","Pages":"8pp","Color":"Color"}','perUnit',NULL,NULL,NULL,1,1758588527987,1758588527987);
INSERT INTO PriceRow VALUES(375,198,'{"Size":"A4","Pages":"12pp","Color":"Color"}','perUnit',NULL,NULL,NULL,1,1758588527989,1758588527989);
INSERT INTO PriceRow VALUES(376,198,'{"Size":"A4","Pages":"16pp","Color":"Color"}','perUnit',NULL,NULL,NULL,1,1758588527991,1758588527991);
INSERT INTO PriceRow VALUES(377,198,'{"Size":"A4","Pages":"20pp","Color":"Color"}','perUnit',NULL,NULL,NULL,1,1758588527993,1758588527993);
INSERT INTO PriceRow VALUES(378,198,'{"Size":"A4","Pages":"24pp","Color":"Color"}','perUnit',NULL,NULL,NULL,1,1758588527995,1758588527995);
INSERT INTO PriceRow VALUES(379,198,'{"Size":"A4","Pages":"28pp","Color":"Color"}','perUnit',NULL,NULL,NULL,1,1758588527997,1758588527997);
INSERT INTO PriceRow VALUES(380,198,'{"Size":"A4","Pages":"32pp","Color":"Color"}','perUnit',NULL,NULL,NULL,1,1758588527999,1758588527999);
INSERT INTO PriceRow VALUES(381,198,'{"Size":"A4","Pages":"36pp","Color":"Color"}','perUnit',NULL,NULL,NULL,1,1758588528001,1758588528001);
INSERT INTO PriceRow VALUES(382,198,'{"Size":"A4","Pages":"40pp","Color":"Color"}','perUnit',NULL,NULL,NULL,1,1758588528003,1758588528003);
INSERT INTO PriceRow VALUES(383,198,'{"Size":"A4","Pages":"44pp","Color":"Color"}','perUnit',NULL,NULL,NULL,1,1758588528005,1758588528005);
INSERT INTO PriceRow VALUES(384,198,'{"Size":"A4","Pages":"48pp","Color":"Color"}','perUnit',NULL,NULL,NULL,1,1758588528007,1758588528007);
INSERT INTO PriceRow VALUES(385,198,'{"Size":"A4","Pages":"52pp","Color":"Color"}','perUnit',NULL,NULL,NULL,1,1758588528009,1758588528009);
INSERT INTO PriceRow VALUES(386,198,'{"Size":"A4","Pages":"56pp","Color":"Color"}','perUnit',NULL,NULL,NULL,1,1758588528011,1758588528011);
INSERT INTO PriceRow VALUES(387,198,'{"Size":"A4","Pages":"60pp","Color":"Color"}','perUnit',NULL,NULL,NULL,1,1758588528013,1758588528013);
INSERT INTO PriceRow VALUES(388,198,'{"Size":"A4","Pages":"64pp","Color":"Color"}','perUnit',NULL,NULL,NULL,1,1758588528015,1758588528015);
INSERT INTO PriceRow VALUES(389,198,'{"Size":"A4","Pages":"68pp","Color":"Color"}','perUnit',NULL,NULL,NULL,1,1758588528017,1758588528017);
INSERT INTO PriceRow VALUES(390,198,'{"Size":"A5","Pages":"8pp","Color":"Color"}','perUnit',NULL,NULL,NULL,1,1758588528020,1758588528020);
INSERT INTO PriceRow VALUES(391,198,'{"Size":"A5","Pages":"12pp","Color":"Color"}','perUnit',NULL,NULL,NULL,1,1758588528022,1758588528022);
INSERT INTO PriceRow VALUES(392,198,'{"Size":"A5","Pages":"16pp","Color":"Color"}','perUnit',NULL,NULL,NULL,1,1758588528024,1758588528024);
INSERT INTO PriceRow VALUES(393,198,'{"Size":"A5","Pages":"20pp","Color":"Color"}','perUnit',NULL,NULL,NULL,1,1758588528026,1758588528026);
INSERT INTO PriceRow VALUES(394,198,'{"Size":"A5","Pages":"24pp","Color":"Color"}','perUnit',NULL,NULL,NULL,1,1758588528028,1758588528028);
INSERT INTO PriceRow VALUES(395,198,'{"Size":"A5","Pages":"28pp","Color":"Color"}','perUnit',NULL,NULL,NULL,1,1758588528030,1758588528030);
INSERT INTO PriceRow VALUES(396,198,'{"Size":"A5","Pages":"32pp","Color":"Color"}','perUnit',NULL,NULL,NULL,1,1758588528032,1758588528032);
INSERT INTO PriceRow VALUES(397,198,'{"Size":"A5","Pages":"36pp","Color":"Color"}','perUnit',NULL,NULL,NULL,1,1758588528034,1758588528034);
INSERT INTO PriceRow VALUES(398,198,'{"Size":"A5","Pages":"40pp","Color":"Color"}','perUnit',NULL,NULL,NULL,1,1758588528036,1758588528036);
INSERT INTO PriceRow VALUES(399,198,'{"Size":"A5","Pages":"48pp","Color":"Color"}','perUnit',NULL,NULL,NULL,1,1758588528038,1758588528038);
INSERT INTO PriceRow VALUES(400,198,'{"Size":"A5","Pages":"52pp","Color":"Color"}','perUnit',NULL,NULL,NULL,1,1758588528040,1758588528040);
INSERT INTO PriceRow VALUES(401,198,'{"Size":"A5","Pages":"56pp","Color":"Color"}','perUnit',NULL,NULL,NULL,1,1758588528042,1758588528042);
INSERT INTO PriceRow VALUES(402,198,'{"Size":"A5","Pages":"60pp","Color":"Color"}','perUnit',NULL,NULL,NULL,1,1758588528044,1758588528044);
INSERT INTO PriceRow VALUES(403,198,'{"Size":"A5","Pages":"64pp","Color":"Color"}','perUnit',NULL,NULL,NULL,1,1758588528046,1758588528046);
INSERT INTO PriceRow VALUES(404,198,'{"Size":"A5","Pages":"68pp","Color":"Color"}','perUnit',NULL,NULL,NULL,1,1758588528048,1758588528048);
INSERT INTO PriceRow VALUES(405,198,'{"Size":"A6","Pages":"8pp","Color":"Color"}','perUnit',NULL,NULL,NULL,1,1758588528050,1758588528050);
INSERT INTO PriceRow VALUES(406,198,'{"Size":"A6","Pages":"12pp","Color":"Color"}','perUnit',NULL,NULL,NULL,1,1758588528052,1758588528052);
INSERT INTO PriceRow VALUES(407,198,'{"Size":"A6","Pages":"16pp","Color":"Color"}','perUnit',NULL,NULL,NULL,1,1758588528054,1758588528054);
INSERT INTO PriceRow VALUES(408,198,'{"Size":"A6","Pages":"20pp","Color":"Color"}','perUnit',NULL,NULL,NULL,1,1758588528056,1758588528056);
INSERT INTO PriceRow VALUES(409,198,'{"Size":"A6","Pages":"24pp","Color":"Color"}','perUnit',NULL,NULL,NULL,1,1758588528058,1758588528058);
INSERT INTO PriceRow VALUES(410,198,'{"Size":"A6","Pages":"28pp","Color":"Color"}','perUnit',NULL,NULL,NULL,1,1758588528060,1758588528060);
INSERT INTO PriceRow VALUES(411,198,'{"Size":"A6","Pages":"32pp","Color":"Color"}','perUnit',NULL,NULL,NULL,1,1758588528063,1758588528063);
INSERT INTO PriceRow VALUES(412,198,'{"Size":"A6","Pages":"36pp","Color":"Color"}','perUnit',NULL,NULL,NULL,1,1758588528065,1758588528065);
INSERT INTO PriceRow VALUES(413,198,'{"Size":"A6","Pages":"40pp","Color":"Color"}','perUnit',NULL,NULL,NULL,1,1758588528067,1758588528067);
INSERT INTO PriceRow VALUES(414,198,'{"Size":"A6","Pages":"44pp","Color":"Color"}','perUnit',NULL,NULL,NULL,1,1758588528069,1758588528069);
INSERT INTO PriceRow VALUES(415,198,'{"Size":"A6","Pages":"48pp","Color":"Color"}','perUnit',NULL,NULL,NULL,1,1758588528071,1758588528071);
INSERT INTO PriceRow VALUES(416,198,'{"Size":"A6","Pages":"52pp","Color":"Color"}','perUnit',NULL,NULL,NULL,1,1758588528073,1758588528073);
INSERT INTO PriceRow VALUES(417,198,'{"Size":"A6","Pages":"56pp","Color":"Color"}','perUnit',NULL,NULL,NULL,1,1758588528075,1758588528075);
INSERT INTO PriceRow VALUES(418,198,'{"Size":"A6","Pages":"60pp","Color":"Color"}','perUnit',NULL,NULL,NULL,1,1758588528077,1758588528077);
INSERT INTO PriceRow VALUES(419,200,'{"Size":"A3","Paper":"100gsm paper"}','perUnit',NULL,NULL,NULL,1,1758589021509,1758589021509);
INSERT INTO PriceRow VALUES(420,200,'{"Size":"A4","Paper":"100gsm paper"}','perUnit',NULL,NULL,NULL,1,1758589021522,1758589021522);
INSERT INTO PriceRow VALUES(421,199,'{"Size":"A3","Paper":"90gsm paper"}','perUnit',NULL,NULL,NULL,1,1758589021533,1758589021533);
INSERT INTO PriceRow VALUES(422,199,'{"Size":"A4","Paper":"90gsm paper"}','perUnit',NULL,NULL,NULL,1,1758589021543,1758589021543);
INSERT INTO PriceRow VALUES(423,202,'{"Size":"A0","Color":"Color"}','perUnit',NULL,NULL,NULL,1,1758589739675,1758589739675);
INSERT INTO PriceRow VALUES(424,202,'{"Size":"A1","Color":"Color"}','perUnit',NULL,NULL,NULL,1,1758589739680,1758589739680);
INSERT INTO PriceRow VALUES(425,202,'{"Size":"A2","Color":"Color"}','perUnit',NULL,NULL,NULL,1,1758589739685,1758589739685);
INSERT INTO PriceRow VALUES(426,201,'{"Size":"A0","Color":"Color"}','perUnit',NULL,NULL,NULL,1,1758589739688,1758589739688);
INSERT INTO PriceRow VALUES(427,201,'{"Size":"A1","Color":"Color"}','perUnit',NULL,NULL,NULL,1,1758589739691,1758589739691);
INSERT INTO PriceRow VALUES(428,201,'{"Size":"A2","Color":"Color"}','perUnit',NULL,NULL,NULL,1,1758589739694,1758589739694);
INSERT INTO PriceRow VALUES(429,201,'{"Size":"A0","Color":"BW"}','perUnit',NULL,NULL,NULL,1,1758589739696,1758589739696);
INSERT INTO PriceRow VALUES(430,201,'{"Size":"A1","Color":"BW"}','perUnit',NULL,NULL,NULL,1,1758589739699,1758589739699);
INSERT INTO PriceRow VALUES(431,201,'{"Size":"A2","Color":"BW"}','perUnit',NULL,NULL,NULL,1,1758589739701,1758589739701);
INSERT INTO PriceRow VALUES(432,204,'{"Type":"Birthday","Size":"A6","Sides":"Single Sided"}','perUnit',NULL,NULL,NULL,1,1758589777810,1758589777810);
INSERT INTO PriceRow VALUES(433,204,'{"Type":"Birthday","Size":"A6","Sides":"Double Sided"}','perUnit',NULL,NULL,NULL,1,1758589777813,1758589777813);
INSERT INTO PriceRow VALUES(434,204,'{"Type":"Wedding","Size":"A5","Sides":"Single Sided"}','perUnit',NULL,NULL,NULL,1,1758589777817,1758589777817);
INSERT INTO PriceRow VALUES(435,204,'{"Type":"Wedding","Size":"A5","Sides":"Double Sided"}','perUnit',NULL,NULL,NULL,1,1758589777820,1758589777820);
INSERT INTO PriceRow VALUES(436,205,'{"Pages":"4pp"}','perUnit',NULL,NULL,NULL,1,1758589777822,1758589777822);
INSERT INTO PriceRow VALUES(437,205,'{"Pages":"8pp"}','perUnit',NULL,NULL,NULL,1,1758589777825,1758589777825);
INSERT INTO PriceRow VALUES(438,205,'{"Pages":"12pp"}','perUnit',NULL,NULL,NULL,1,1758589777827,1758589777827);
INSERT INTO PriceRow VALUES(439,205,'{"Pages":"16pp"}','perUnit',NULL,NULL,NULL,1,1758589777829,1758589777829);
INSERT INTO PriceRow VALUES(440,205,'{"Pages":"20pp"}','perUnit',NULL,NULL,NULL,1,1758589777831,1758589777831);
INSERT INTO PriceRow VALUES(441,205,'{"Pages":"24pp"}','perUnit',NULL,NULL,NULL,1,1758589777834,1758589777834);
INSERT INTO PriceRow VALUES(442,206,'{"Type":"Wedding"}','perUnit',NULL,NULL,NULL,1,1758589777837,1758589777837);
INSERT INTO PriceRow VALUES(443,207,'{"Sides":"Single Sided","Color":"BW"}','perUnit',NULL,NULL,NULL,1,1758589777840,1758589777840);
INSERT INTO PriceRow VALUES(444,207,'{"Sides":"Double Sided","Color":"Color+Color"}','perUnit',NULL,NULL,NULL,1,1758589777843,1758589777843);
INSERT INTO PriceRow VALUES(445,207,'{"Sides":"Double Sided","Color":"BW+BW"}','perUnit',NULL,NULL,NULL,1,1758589777846,1758589777846);
INSERT INTO PriceRow VALUES(446,210,'{"Size":"320x450mm","Pages":"13pp"}','perUnit',NULL,NULL,NULL,1,1758589814346,1758589814346);
INSERT INTO PriceRow VALUES(447,210,'{"Size":"160x450mm","Pages":"13pp"}','perUnit',NULL,NULL,NULL,1,1758589814351,1758589814351);
INSERT INTO PriceRow VALUES(448,209,'{"Size":"A6"}','perUnit',NULL,NULL,NULL,1,1758589814355,1758589814355);
INSERT INTO PriceRow VALUES(449,208,'{"Size":"A6","Sides":"Single Sided"}','perUnit',NULL,NULL,NULL,1,1758589814358,1758589814358);
INSERT INTO PriceRow VALUES(450,208,'{"Size":"A6","Sides":"Double Sided"}','perUnit',NULL,NULL,NULL,1,1758589814362,1758589814362);
INSERT INTO PriceRow VALUES(451,208,'{"Size":"A5","Sides":"Single Sided"}','perUnit',NULL,NULL,NULL,1,1758589814365,1758589814365);
INSERT INTO PriceRow VALUES(452,208,'{"Size":"A5","Sides":"Double Sided"}','perUnit',NULL,NULL,NULL,1,1758589814368,1758589814368);
INSERT INTO PriceRow VALUES(453,208,'{"Size":"DL","Sides":"Single Sided"}','perUnit',NULL,NULL,NULL,1,1758589814370,1758589814370);
INSERT INTO PriceRow VALUES(454,208,'{"Size":"Square 145x145","Sides":"Single Sided"}','perUnit',NULL,NULL,NULL,1,1758589814372,1758589814372);
INSERT INTO PriceRow VALUES(455,208,'{"Size":"Square 145x145","Sides":"Double Sided"}','perUnit',NULL,NULL,NULL,1,1758589814374,1758589814374);
INSERT INTO PriceRow VALUES(460,213,'{"Size":"A4"}','perUnit',NULL,NULL,NULL,1,1758589862077,1758589862077);
INSERT INTO PriceRow VALUES(461,213,'{"Size":"A3"}','perUnit',NULL,NULL,NULL,1,1758589862080,1758589862080);
INSERT INTO PriceRow VALUES(462,213,'{"Size":"A2"}','perUnit',NULL,NULL,NULL,1,1758589862084,1758589862084);
INSERT INTO PriceRow VALUES(463,213,'{"Size":"A1"}','perUnit',NULL,NULL,NULL,1,1758589862088,1758589862088);
INSERT INTO PriceRow VALUES(464,214,'{"Type":"Up to 50 pages"}','perUnit',NULL,NULL,NULL,1,1758589914205,1758589914205);
INSERT INTO PriceRow VALUES(465,214,'{"Type":"50+ pages"}','perUnit',NULL,NULL,NULL,1,1758589914208,1758589914208);
INSERT INTO PriceRow VALUES(466,215,'{"Type":"Standard"}','perUnit',NULL,NULL,NULL,1,1758589914211,1758589914211);
INSERT INTO PriceRow VALUES(467,216,'{"Type":"1st fold"}','perUnit',NULL,NULL,NULL,1,1758589914213,1758589914213);
INSERT INTO PriceRow VALUES(468,216,'{"Type":"2nd fold"}','perUnit',NULL,NULL,NULL,1,1758589914215,1758589914215);
INSERT INTO PriceRow VALUES(469,217,'{"Type":"Standard"}','perUnit',NULL,NULL,NULL,1,1758589914218,1758589914218);
INSERT INTO PriceRow VALUES(470,218,'{"Type":"Standard"}','perUnit',NULL,NULL,NULL,1,1758589914221,1758589914221);
CREATE TABLE IF NOT EXISTS "Tier" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "rowId" INTEGER NOT NULL,
    "qty" INTEGER NOT NULL,
    "unit" REAL NOT NULL,
    CONSTRAINT "Tier_rowId_fkey" FOREIGN KEY ("rowId") REFERENCES "PriceRow" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO Tier VALUES(345,188,100,0.5500000000000000444);
INSERT INTO Tier VALUES(346,188,250,0.5);
INSERT INTO Tier VALUES(347,188,500,0.4000000000000000222);
INSERT INTO Tier VALUES(348,188,750,0.3499999999999999778);
INSERT INTO Tier VALUES(349,188,1000,0.2999999999999999889);
INSERT INTO Tier VALUES(350,188,2000,0.2000000000000000111);
INSERT INTO Tier VALUES(351,188,5000,0.1000000000000000055);
INSERT INTO Tier VALUES(352,189,100,0.2999999999999999889);
INSERT INTO Tier VALUES(353,189,250,0.25);
INSERT INTO Tier VALUES(354,189,500,0.2000000000000000111);
INSERT INTO Tier VALUES(355,189,750,0.1700000000000000122);
INSERT INTO Tier VALUES(356,189,1000,0.1499999999999999945);
INSERT INTO Tier VALUES(357,189,2000,0.1000000000000000055);
INSERT INTO Tier VALUES(358,189,5000,0.08000000000000000166);
INSERT INTO Tier VALUES(359,190,100,0.2200000000000000011);
INSERT INTO Tier VALUES(360,190,250,0.1700000000000000122);
INSERT INTO Tier VALUES(361,190,500,0.1499999999999999945);
INSERT INTO Tier VALUES(362,190,750,0.1300000000000000044);
INSERT INTO Tier VALUES(363,190,1000,0.1000000000000000055);
INSERT INTO Tier VALUES(364,190,2000,0.08999999999999999667);
INSERT INTO Tier VALUES(365,190,5000,0.05000000000000000277);
INSERT INTO Tier VALUES(366,191,100,0.2999999999999999889);
INSERT INTO Tier VALUES(367,191,250,0.2000000000000000111);
INSERT INTO Tier VALUES(368,191,500,0.1700000000000000122);
INSERT INTO Tier VALUES(369,191,750,0.1499999999999999945);
INSERT INTO Tier VALUES(370,191,1000,0.1300000000000000044);
INSERT INTO Tier VALUES(371,191,2000,0.1000000000000000055);
INSERT INTO Tier VALUES(372,191,5000,0.07000000000000000667);
INSERT INTO Tier VALUES(373,192,100,0.2000000000000000111);
INSERT INTO Tier VALUES(374,192,250,0.1000000000000000055);
INSERT INTO Tier VALUES(375,192,500,0.08999999999999999667);
INSERT INTO Tier VALUES(376,192,750,0.08000000000000000166);
INSERT INTO Tier VALUES(377,192,1000,0.07000000000000000667);
INSERT INTO Tier VALUES(378,192,2000,0.05999999999999999778);
INSERT INTO Tier VALUES(379,192,5000,0.05000000000000000277);
INSERT INTO Tier VALUES(380,193,100,0.2999999999999999889);
INSERT INTO Tier VALUES(381,193,250,0.2000000000000000111);
INSERT INTO Tier VALUES(382,193,500,0.1700000000000000122);
INSERT INTO Tier VALUES(383,193,750,0.1499999999999999945);
INSERT INTO Tier VALUES(384,193,1000,0.1300000000000000044);
INSERT INTO Tier VALUES(385,193,2000,0.1000000000000000055);
INSERT INTO Tier VALUES(386,193,5000,0.07000000000000000667);
INSERT INTO Tier VALUES(387,194,100,0.25);
INSERT INTO Tier VALUES(388,194,250,0.1499999999999999945);
INSERT INTO Tier VALUES(389,194,500,0.1400000000000000134);
INSERT INTO Tier VALUES(390,194,750,0.1300000000000000044);
INSERT INTO Tier VALUES(391,194,1000,0.1000000000000000055);
INSERT INTO Tier VALUES(392,194,2000,0.08999999999999999667);
INSERT INTO Tier VALUES(393,194,5000,0.05999999999999999778);
INSERT INTO Tier VALUES(394,195,100,0.2000000000000000111);
INSERT INTO Tier VALUES(395,195,250,0.1700000000000000122);
INSERT INTO Tier VALUES(396,195,500,0.1499999999999999945);
INSERT INTO Tier VALUES(397,195,750,0.1199999999999999956);
INSERT INTO Tier VALUES(398,195,1000,0.1000000000000000055);
INSERT INTO Tier VALUES(399,195,2000,0.08000000000000000166);
INSERT INTO Tier VALUES(400,195,5000,0.07000000000000000667);
INSERT INTO Tier VALUES(401,196,100,0.5);
INSERT INTO Tier VALUES(402,196,250,0.4500000000000000111);
INSERT INTO Tier VALUES(403,196,500,0.3499999999999999778);
INSERT INTO Tier VALUES(404,196,750,0.3200000000000000066);
INSERT INTO Tier VALUES(405,196,1000,0.2999999999999999889);
INSERT INTO Tier VALUES(406,196,2000,0.2000000000000000111);
INSERT INTO Tier VALUES(407,196,5000,0.1199999999999999956);
INSERT INTO Tier VALUES(408,197,100,0.1000000000000000055);
INSERT INTO Tier VALUES(409,197,250,0.08000000000000000166);
INSERT INTO Tier VALUES(410,197,500,0.08000000000000000166);
INSERT INTO Tier VALUES(411,197,750,0.05999999999999999778);
INSERT INTO Tier VALUES(412,197,1000,0.05999999999999999778);
INSERT INTO Tier VALUES(413,197,2000,0.05000000000000000277);
INSERT INTO Tier VALUES(414,197,5000,0.02999999999999999889);
INSERT INTO Tier VALUES(415,198,100,0.1499999999999999945);
INSERT INTO Tier VALUES(416,198,250,0.1000000000000000055);
INSERT INTO Tier VALUES(417,198,500,0.08999999999999999667);
INSERT INTO Tier VALUES(418,198,750,0.08000000000000000166);
INSERT INTO Tier VALUES(419,198,1000,0.07000000000000000667);
INSERT INTO Tier VALUES(420,198,2000,0.05000000000000000277);
INSERT INTO Tier VALUES(421,198,5000,0.02999999999999999889);
INSERT INTO Tier VALUES(422,199,100,0.2000000000000000111);
INSERT INTO Tier VALUES(423,199,250,0.1499999999999999945);
INSERT INTO Tier VALUES(424,199,500,0.1300000000000000044);
INSERT INTO Tier VALUES(425,199,750,0.1199999999999999956);
INSERT INTO Tier VALUES(426,199,1000,0.08999999999999999667);
INSERT INTO Tier VALUES(427,199,2000,0.07000000000000000667);
INSERT INTO Tier VALUES(428,199,5000,0.04000000000000000083);
INSERT INTO Tier VALUES(429,200,100,0.2999999999999999889);
INSERT INTO Tier VALUES(430,200,250,0.25);
INSERT INTO Tier VALUES(431,200,500,0.2200000000000000011);
INSERT INTO Tier VALUES(432,200,750,0.1799999999999999934);
INSERT INTO Tier VALUES(433,200,1000,0.1499999999999999945);
INSERT INTO Tier VALUES(434,200,2000,0.1000000000000000055);
INSERT INTO Tier VALUES(435,200,5000,0.05999999999999999778);
INSERT INTO Tier VALUES(436,201,100,0.2000000000000000111);
INSERT INTO Tier VALUES(437,201,250,0.1700000000000000122);
INSERT INTO Tier VALUES(438,201,500,0.1499999999999999945);
INSERT INTO Tier VALUES(439,201,750,0.1300000000000000044);
INSERT INTO Tier VALUES(440,201,1000,0.1000000000000000055);
INSERT INTO Tier VALUES(441,201,2000,0.08999999999999999667);
INSERT INTO Tier VALUES(442,201,5000,0.05000000000000000277);
INSERT INTO Tier VALUES(443,202,100,0.2999999999999999889);
INSERT INTO Tier VALUES(444,202,250,0.2000000000000000111);
INSERT INTO Tier VALUES(445,202,500,0.1700000000000000122);
INSERT INTO Tier VALUES(446,202,750,0.1499999999999999945);
INSERT INTO Tier VALUES(447,202,1000,0.1300000000000000044);
INSERT INTO Tier VALUES(448,202,2000,0.1000000000000000055);
INSERT INTO Tier VALUES(449,202,5000,0.07000000000000000667);
INSERT INTO Tier VALUES(450,203,500,0.08000000000000000166);
INSERT INTO Tier VALUES(451,203,750,0.07000000000000000667);
INSERT INTO Tier VALUES(452,203,1000,0.05999999999999999778);
INSERT INTO Tier VALUES(453,203,2000,0.05000000000000000277);
INSERT INTO Tier VALUES(454,203,5000,0.04000000000000000083);
INSERT INTO Tier VALUES(455,203,10000,0.02999999999999999889);
INSERT INTO Tier VALUES(456,204,500,0.1400000000000000134);
INSERT INTO Tier VALUES(457,204,750,0.1199999999999999956);
INSERT INTO Tier VALUES(458,204,1000,0.1000000000000000055);
INSERT INTO Tier VALUES(459,204,2000,0.08999999999999999667);
INSERT INTO Tier VALUES(460,204,5000,0.05999999999999999778);
INSERT INTO Tier VALUES(461,204,10000,0.05000000000000000277);
INSERT INTO Tier VALUES(462,207,100,0.5999999999999999778);
INSERT INTO Tier VALUES(463,208,100,0.5999999999999999778);
INSERT INTO Tier VALUES(464,207,200,0.5);
INSERT INTO Tier VALUES(465,208,200,0.5);
INSERT INTO Tier VALUES(466,207,300,0.4500000000000000111);
INSERT INTO Tier VALUES(467,208,300,0.4500000000000000111);
INSERT INTO Tier VALUES(468,207,400,0.4000000000000000222);
INSERT INTO Tier VALUES(469,208,400,0.4000000000000000222);
INSERT INTO Tier VALUES(470,207,500,0.3499999999999999778);
INSERT INTO Tier VALUES(471,208,500,0.3499999999999999778);
INSERT INTO Tier VALUES(472,207,1000,0.2999999999999999889);
INSERT INTO Tier VALUES(473,208,1000,0.2999999999999999889);
INSERT INTO Tier VALUES(474,207,2000,0.25);
INSERT INTO Tier VALUES(475,208,2000,0.25);
INSERT INTO Tier VALUES(476,207,3000,0.2000000000000000111);
INSERT INTO Tier VALUES(477,208,3000,0.2000000000000000111);
INSERT INTO Tier VALUES(478,207,4000,0.1700000000000000122);
INSERT INTO Tier VALUES(479,208,4000,0.1700000000000000122);
INSERT INTO Tier VALUES(480,207,5000,0.1499999999999999945);
INSERT INTO Tier VALUES(481,208,5000,0.1499999999999999945);
INSERT INTO Tier VALUES(482,207,10000,0.08999999999999999667);
INSERT INTO Tier VALUES(483,208,10000,0.08999999999999999667);
INSERT INTO Tier VALUES(484,209,100,0.8000000000000000444);
INSERT INTO Tier VALUES(485,210,100,0.8000000000000000444);
INSERT INTO Tier VALUES(486,209,200,0.75);
INSERT INTO Tier VALUES(487,210,200,0.75);
INSERT INTO Tier VALUES(488,209,300,0.6999999999999999556);
INSERT INTO Tier VALUES(489,210,300,0.6999999999999999556);
INSERT INTO Tier VALUES(490,209,400,0.5999999999999999778);
INSERT INTO Tier VALUES(491,210,400,0.5999999999999999778);
INSERT INTO Tier VALUES(492,209,500,0.5500000000000000444);
INSERT INTO Tier VALUES(493,210,500,0.5500000000000000444);
INSERT INTO Tier VALUES(494,209,1000,0.5);
INSERT INTO Tier VALUES(495,210,1000,0.5);
INSERT INTO Tier VALUES(496,209,2000,0.3499999999999999778);
INSERT INTO Tier VALUES(497,210,2000,0.3499999999999999778);
INSERT INTO Tier VALUES(498,209,3000,0.2700000000000000177);
INSERT INTO Tier VALUES(499,210,3000,0.2700000000000000177);
INSERT INTO Tier VALUES(500,209,4000,0.2000000000000000111);
INSERT INTO Tier VALUES(501,210,4000,0.2000000000000000111);
INSERT INTO Tier VALUES(502,209,5000,0.1700000000000000122);
INSERT INTO Tier VALUES(503,210,5000,0.1700000000000000122);
INSERT INTO Tier VALUES(504,209,10000,0.1199999999999999956);
INSERT INTO Tier VALUES(505,210,10000,0.1199999999999999956);
INSERT INTO Tier VALUES(506,211,100,0.2999999999999999889);
INSERT INTO Tier VALUES(507,212,100,0.2999999999999999889);
INSERT INTO Tier VALUES(508,211,200,0.25);
INSERT INTO Tier VALUES(509,212,200,0.25);
INSERT INTO Tier VALUES(510,211,300,0.2200000000000000011);
INSERT INTO Tier VALUES(511,212,300,0.2200000000000000011);
INSERT INTO Tier VALUES(512,211,400,0.2000000000000000111);
INSERT INTO Tier VALUES(513,212,400,0.2000000000000000111);
INSERT INTO Tier VALUES(514,211,500,0.1799999999999999934);
INSERT INTO Tier VALUES(515,212,500,0.1799999999999999934);
INSERT INTO Tier VALUES(516,211,1000,0.1700000000000000122);
INSERT INTO Tier VALUES(517,212,1000,0.1700000000000000122);
INSERT INTO Tier VALUES(518,211,2000,0.1499999999999999945);
INSERT INTO Tier VALUES(519,212,2000,0.1499999999999999945);
INSERT INTO Tier VALUES(520,211,3000,0.1300000000000000044);
INSERT INTO Tier VALUES(521,212,3000,0.1300000000000000044);
INSERT INTO Tier VALUES(522,211,4000,0.1199999999999999956);
INSERT INTO Tier VALUES(523,212,4000,0.1199999999999999956);
INSERT INTO Tier VALUES(524,211,5000,0.1000000000000000055);
INSERT INTO Tier VALUES(525,212,5000,0.1000000000000000055);
INSERT INTO Tier VALUES(526,211,10000,0.08000000000000000166);
INSERT INTO Tier VALUES(527,212,10000,0.08000000000000000166);
INSERT INTO Tier VALUES(528,213,100,0.5);
INSERT INTO Tier VALUES(529,214,100,0.5);
INSERT INTO Tier VALUES(530,213,200,0.4000000000000000222);
INSERT INTO Tier VALUES(531,214,200,0.4000000000000000222);
INSERT INTO Tier VALUES(532,213,300,0.3699999999999999956);
INSERT INTO Tier VALUES(533,214,300,0.3699999999999999956);
INSERT INTO Tier VALUES(534,213,400,0.3499999999999999778);
INSERT INTO Tier VALUES(535,214,400,0.3499999999999999778);
INSERT INTO Tier VALUES(536,213,500,0.2999999999999999889);
INSERT INTO Tier VALUES(537,214,500,0.2999999999999999889);
INSERT INTO Tier VALUES(538,213,1000,0.25);
INSERT INTO Tier VALUES(539,214,1000,0.25);
INSERT INTO Tier VALUES(540,213,2000,0.2300000000000000099);
INSERT INTO Tier VALUES(541,214,2000,0.2300000000000000099);
INSERT INTO Tier VALUES(542,213,3000,0.1700000000000000122);
INSERT INTO Tier VALUES(543,214,3000,0.1700000000000000122);
INSERT INTO Tier VALUES(544,213,4000,0.1499999999999999945);
INSERT INTO Tier VALUES(545,214,4000,0.1499999999999999945);
INSERT INTO Tier VALUES(546,213,5000,0.1400000000000000134);
INSERT INTO Tier VALUES(547,214,5000,0.1400000000000000134);
INSERT INTO Tier VALUES(548,213,10000,0.1100000000000000005);
INSERT INTO Tier VALUES(549,214,10000,0.1100000000000000005);
INSERT INTO Tier VALUES(550,215,100,0.2000000000000000111);
INSERT INTO Tier VALUES(551,216,100,0.2000000000000000111);
INSERT INTO Tier VALUES(552,215,200,0.1799999999999999934);
INSERT INTO Tier VALUES(553,216,200,0.1799999999999999934);
INSERT INTO Tier VALUES(554,215,300,0.1700000000000000122);
INSERT INTO Tier VALUES(555,216,300,0.1700000000000000122);
INSERT INTO Tier VALUES(556,215,400,0.1499999999999999945);
INSERT INTO Tier VALUES(557,216,400,0.1499999999999999945);
INSERT INTO Tier VALUES(558,215,500,0.1400000000000000134);
INSERT INTO Tier VALUES(559,216,500,0.1400000000000000134);
INSERT INTO Tier VALUES(560,215,1000,0.1199999999999999956);
INSERT INTO Tier VALUES(561,216,1000,0.1199999999999999956);
INSERT INTO Tier VALUES(562,215,2000,0.1000000000000000055);
INSERT INTO Tier VALUES(563,216,2000,0.1000000000000000055);
INSERT INTO Tier VALUES(564,215,3000,0.08999999999999999667);
INSERT INTO Tier VALUES(565,216,3000,0.08999999999999999667);
INSERT INTO Tier VALUES(566,215,4000,0.08000000000000000166);
INSERT INTO Tier VALUES(567,216,4000,0.08000000000000000166);
INSERT INTO Tier VALUES(568,215,5000,0.07000000000000000667);
INSERT INTO Tier VALUES(569,216,5000,0.07000000000000000667);
INSERT INTO Tier VALUES(570,215,10000,0.05000000000000000277);
INSERT INTO Tier VALUES(571,216,10000,0.05000000000000000277);
INSERT INTO Tier VALUES(572,217,100,0.2999999999999999889);
INSERT INTO Tier VALUES(573,218,100,0.2999999999999999889);
INSERT INTO Tier VALUES(574,217,200,0.2700000000000000177);
INSERT INTO Tier VALUES(575,218,200,0.2700000000000000177);
INSERT INTO Tier VALUES(576,217,300,0.2600000000000000088);
INSERT INTO Tier VALUES(577,218,300,0.2600000000000000088);
INSERT INTO Tier VALUES(578,217,400,0.25);
INSERT INTO Tier VALUES(579,218,400,0.25);
INSERT INTO Tier VALUES(580,217,500,0.2399999999999999912);
INSERT INTO Tier VALUES(581,218,500,0.2399999999999999912);
INSERT INTO Tier VALUES(582,217,1000,0.2000000000000000111);
INSERT INTO Tier VALUES(583,218,1000,0.2000000000000000111);
INSERT INTO Tier VALUES(584,217,2000,0.1799999999999999934);
INSERT INTO Tier VALUES(585,218,2000,0.1799999999999999934);
INSERT INTO Tier VALUES(586,217,3000,0.1499999999999999945);
INSERT INTO Tier VALUES(587,218,3000,0.1499999999999999945);
INSERT INTO Tier VALUES(588,217,4000,0.1300000000000000044);
INSERT INTO Tier VALUES(589,218,4000,0.1300000000000000044);
INSERT INTO Tier VALUES(590,217,5000,0.1100000000000000005);
INSERT INTO Tier VALUES(591,218,5000,0.1100000000000000005);
INSERT INTO Tier VALUES(592,217,10000,0.07000000000000000667);
INSERT INTO Tier VALUES(593,218,10000,0.07000000000000000667);
INSERT INTO Tier VALUES(594,219,500,0.1100000000000000005);
INSERT INTO Tier VALUES(595,220,500,0.1100000000000000005);
INSERT INTO Tier VALUES(596,219,1000,0.08999999999999999667);
INSERT INTO Tier VALUES(597,220,1000,0.08999999999999999667);
INSERT INTO Tier VALUES(598,219,2000,0.07499999999999999723);
INSERT INTO Tier VALUES(599,220,2000,0.07499999999999999723);
INSERT INTO Tier VALUES(600,219,3000,0.07000000000000000667);
INSERT INTO Tier VALUES(601,220,3000,0.07000000000000000667);
INSERT INTO Tier VALUES(602,219,4000,0.05999999999999999778);
INSERT INTO Tier VALUES(603,220,4000,0.05999999999999999778);
INSERT INTO Tier VALUES(604,219,5000,0.05000000000000000277);
INSERT INTO Tier VALUES(605,220,5000,0.05000000000000000277);
INSERT INTO Tier VALUES(606,219,10000,0.02999999999999999889);
INSERT INTO Tier VALUES(607,220,10000,0.02999999999999999889);
INSERT INTO Tier VALUES(608,221,500,0.1799999999999999934);
INSERT INTO Tier VALUES(609,222,500,0.1799999999999999934);
INSERT INTO Tier VALUES(610,221,1000,0.1499999999999999945);
INSERT INTO Tier VALUES(611,222,1000,0.1499999999999999945);
INSERT INTO Tier VALUES(612,221,2000,0.1300000000000000044);
INSERT INTO Tier VALUES(613,222,2000,0.1300000000000000044);
INSERT INTO Tier VALUES(614,221,3000,0.1199999999999999956);
INSERT INTO Tier VALUES(615,222,3000,0.1199999999999999956);
INSERT INTO Tier VALUES(616,221,4000,0.1100000000000000005);
INSERT INTO Tier VALUES(617,222,4000,0.1100000000000000005);
INSERT INTO Tier VALUES(618,221,5000,0.08999999999999999667);
INSERT INTO Tier VALUES(619,222,5000,0.08999999999999999667);
INSERT INTO Tier VALUES(620,221,10000,0.05000000000000000277);
INSERT INTO Tier VALUES(621,222,10000,0.05000000000000000277);
INSERT INTO Tier VALUES(622,223,100,0.2000000000000000111);
INSERT INTO Tier VALUES(623,224,100,0.2000000000000000111);
INSERT INTO Tier VALUES(624,223,200,0.1900000000000000022);
INSERT INTO Tier VALUES(625,224,200,0.1900000000000000022);
INSERT INTO Tier VALUES(626,223,300,0.1799999999999999934);
INSERT INTO Tier VALUES(627,224,300,0.1799999999999999934);
INSERT INTO Tier VALUES(628,223,400,0.1700000000000000122);
INSERT INTO Tier VALUES(629,224,400,0.1700000000000000122);
INSERT INTO Tier VALUES(630,223,500,0.1600000000000000033);
INSERT INTO Tier VALUES(631,224,500,0.1600000000000000033);
INSERT INTO Tier VALUES(632,223,1000,0.1199999999999999956);
INSERT INTO Tier VALUES(633,224,1000,0.1199999999999999956);
INSERT INTO Tier VALUES(634,223,2000,0.1199999999999999956);
INSERT INTO Tier VALUES(635,224,2000,0.1199999999999999956);
INSERT INTO Tier VALUES(636,223,3000,0.1000000000000000055);
INSERT INTO Tier VALUES(637,224,3000,0.1000000000000000055);
INSERT INTO Tier VALUES(638,223,4000,0.08999999999999999667);
INSERT INTO Tier VALUES(639,224,4000,0.08999999999999999667);
INSERT INTO Tier VALUES(640,223,5000,0.08000000000000000166);
INSERT INTO Tier VALUES(641,224,5000,0.08000000000000000166);
INSERT INTO Tier VALUES(642,223,10000,0.05999999999999999778);
INSERT INTO Tier VALUES(643,224,10000,0.05999999999999999778);
INSERT INTO Tier VALUES(644,225,100,0.3499999999999999778);
INSERT INTO Tier VALUES(645,226,100,0.3499999999999999778);
INSERT INTO Tier VALUES(646,225,200,0.2999999999999999889);
INSERT INTO Tier VALUES(647,226,200,0.2999999999999999889);
INSERT INTO Tier VALUES(648,225,300,0.25);
INSERT INTO Tier VALUES(649,226,300,0.25);
INSERT INTO Tier VALUES(650,225,400,0.2200000000000000011);
INSERT INTO Tier VALUES(651,226,400,0.2200000000000000011);
INSERT INTO Tier VALUES(652,225,500,0.1900000000000000022);
INSERT INTO Tier VALUES(653,226,500,0.1900000000000000022);
INSERT INTO Tier VALUES(654,225,1000,0.1700000000000000122);
INSERT INTO Tier VALUES(655,226,1000,0.1700000000000000122);
INSERT INTO Tier VALUES(656,225,2000,0.1600000000000000033);
INSERT INTO Tier VALUES(657,226,2000,0.1600000000000000033);
INSERT INTO Tier VALUES(658,225,3000,0.1499999999999999945);
INSERT INTO Tier VALUES(659,226,3000,0.1499999999999999945);
INSERT INTO Tier VALUES(660,225,4000,0.1400000000000000134);
INSERT INTO Tier VALUES(661,226,4000,0.1400000000000000134);
INSERT INTO Tier VALUES(662,225,5000,0.1300000000000000044);
INSERT INTO Tier VALUES(663,226,5000,0.1300000000000000044);
INSERT INTO Tier VALUES(664,225,10000,0.08000000000000000166);
INSERT INTO Tier VALUES(665,226,10000,0.08000000000000000166);
INSERT INTO Tier VALUES(666,227,100,0.1000000000000000055);
INSERT INTO Tier VALUES(667,228,100,0.1000000000000000055);
INSERT INTO Tier VALUES(668,227,200,0.1000000000000000055);
INSERT INTO Tier VALUES(669,228,200,0.1000000000000000055);
INSERT INTO Tier VALUES(670,227,300,0.1000000000000000055);
INSERT INTO Tier VALUES(671,228,300,0.1000000000000000055);
INSERT INTO Tier VALUES(672,227,400,0.1000000000000000055);
INSERT INTO Tier VALUES(673,228,400,0.1000000000000000055);
INSERT INTO Tier VALUES(674,227,500,0.1000000000000000055);
INSERT INTO Tier VALUES(675,228,500,0.1000000000000000055);
INSERT INTO Tier VALUES(676,227,1000,0.08000000000000000166);
INSERT INTO Tier VALUES(677,228,1000,0.08000000000000000166);
INSERT INTO Tier VALUES(678,227,2000,0.07000000000000000667);
INSERT INTO Tier VALUES(679,228,2000,0.07000000000000000667);
INSERT INTO Tier VALUES(680,227,3000,0.05999999999999999778);
INSERT INTO Tier VALUES(681,228,3000,0.05999999999999999778);
INSERT INTO Tier VALUES(682,227,4000,0.05000000000000000277);
INSERT INTO Tier VALUES(683,228,4000,0.05000000000000000277);
INSERT INTO Tier VALUES(684,227,5000,0.04499999999999999834);
INSERT INTO Tier VALUES(685,228,5000,0.04499999999999999834);
INSERT INTO Tier VALUES(686,227,10000,0.03500000000000000334);
INSERT INTO Tier VALUES(687,228,10000,0.03500000000000000334);
INSERT INTO Tier VALUES(688,229,100,0.1499999999999999945);
INSERT INTO Tier VALUES(689,230,100,0.1499999999999999945);
INSERT INTO Tier VALUES(690,229,200,0.1499999999999999945);
INSERT INTO Tier VALUES(691,230,200,0.1499999999999999945);
INSERT INTO Tier VALUES(692,229,300,0.1499999999999999945);
INSERT INTO Tier VALUES(693,230,300,0.1499999999999999945);
INSERT INTO Tier VALUES(694,229,400,0.1499999999999999945);
INSERT INTO Tier VALUES(695,230,400,0.1499999999999999945);
INSERT INTO Tier VALUES(696,229,500,0.1499999999999999945);
INSERT INTO Tier VALUES(697,230,500,0.1499999999999999945);
INSERT INTO Tier VALUES(698,229,1000,0.1199999999999999956);
INSERT INTO Tier VALUES(699,230,1000,0.1199999999999999956);
INSERT INTO Tier VALUES(700,229,2000,0.1100000000000000005);
INSERT INTO Tier VALUES(701,230,2000,0.1100000000000000005);
INSERT INTO Tier VALUES(702,229,3000,0.1000000000000000055);
INSERT INTO Tier VALUES(703,230,3000,0.1000000000000000055);
INSERT INTO Tier VALUES(704,229,4000,0.08999999999999999667);
INSERT INTO Tier VALUES(705,230,4000,0.08999999999999999667);
INSERT INTO Tier VALUES(706,229,5000,0.08000000000000000166);
INSERT INTO Tier VALUES(707,230,5000,0.08000000000000000166);
INSERT INTO Tier VALUES(708,229,10000,0.05999999999999999778);
INSERT INTO Tier VALUES(709,230,10000,0.05999999999999999778);
INSERT INTO Tier VALUES(710,231,100,0.08999999999999999667);
INSERT INTO Tier VALUES(711,232,100,0.08999999999999999667);
INSERT INTO Tier VALUES(712,231,200,0.08999999999999999667);
INSERT INTO Tier VALUES(713,232,200,0.08999999999999999667);
INSERT INTO Tier VALUES(714,231,300,0.08999999999999999667);
INSERT INTO Tier VALUES(715,232,300,0.08999999999999999667);
INSERT INTO Tier VALUES(716,231,400,0.08999999999999999667);
INSERT INTO Tier VALUES(717,232,400,0.08999999999999999667);
INSERT INTO Tier VALUES(718,231,500,0.08999999999999999667);
INSERT INTO Tier VALUES(719,232,500,0.08999999999999999667);
INSERT INTO Tier VALUES(720,231,1000,0.07499999999999999723);
INSERT INTO Tier VALUES(721,232,1000,0.07499999999999999723);
INSERT INTO Tier VALUES(722,231,2000,0.05999999999999999778);
INSERT INTO Tier VALUES(723,232,2000,0.05999999999999999778);
INSERT INTO Tier VALUES(724,231,3000,0.05999999999999999778);
INSERT INTO Tier VALUES(725,232,3000,0.05999999999999999778);
INSERT INTO Tier VALUES(726,231,4000,0.05000000000000000277);
INSERT INTO Tier VALUES(727,232,4000,0.05000000000000000277);
INSERT INTO Tier VALUES(728,231,5000,0.03500000000000000334);
INSERT INTO Tier VALUES(729,232,5000,0.03500000000000000334);
INSERT INTO Tier VALUES(730,231,10000,0.02999999999999999889);
INSERT INTO Tier VALUES(731,232,10000,0.02999999999999999889);
INSERT INTO Tier VALUES(732,233,100,0.1199999999999999956);
INSERT INTO Tier VALUES(733,234,100,0.1199999999999999956);
INSERT INTO Tier VALUES(734,233,200,0.1199999999999999956);
INSERT INTO Tier VALUES(735,234,200,0.1199999999999999956);
INSERT INTO Tier VALUES(736,233,300,0.1199999999999999956);
INSERT INTO Tier VALUES(737,234,300,0.1199999999999999956);
INSERT INTO Tier VALUES(738,233,400,0.1199999999999999956);
INSERT INTO Tier VALUES(739,234,400,0.1199999999999999956);
INSERT INTO Tier VALUES(740,233,500,0.1199999999999999956);
INSERT INTO Tier VALUES(741,234,500,0.1199999999999999956);
INSERT INTO Tier VALUES(742,233,1000,0.1100000000000000005);
INSERT INTO Tier VALUES(743,234,1000,0.1100000000000000005);
INSERT INTO Tier VALUES(744,233,2000,0.1000000000000000055);
INSERT INTO Tier VALUES(745,234,2000,0.1000000000000000055);
INSERT INTO Tier VALUES(746,233,3000,0.1000000000000000055);
INSERT INTO Tier VALUES(747,234,3000,0.1000000000000000055);
INSERT INTO Tier VALUES(748,233,4000,0.08999999999999999667);
INSERT INTO Tier VALUES(749,234,4000,0.08999999999999999667);
INSERT INTO Tier VALUES(750,233,5000,0.07000000000000000667);
INSERT INTO Tier VALUES(751,234,5000,0.07000000000000000667);
INSERT INTO Tier VALUES(752,233,10000,0.05500000000000000027);
INSERT INTO Tier VALUES(753,234,10000,0.05500000000000000027);
INSERT INTO Tier VALUES(754,235,500,0.05999999999999999778);
INSERT INTO Tier VALUES(755,236,500,0.05999999999999999778);
INSERT INTO Tier VALUES(756,235,1000,0.05000000000000000277);
INSERT INTO Tier VALUES(757,236,1000,0.05000000000000000277);
INSERT INTO Tier VALUES(758,235,2000,0.06500000000000000222);
INSERT INTO Tier VALUES(759,236,2000,0.06500000000000000222);
INSERT INTO Tier VALUES(760,235,3000,0.05000000000000000277);
INSERT INTO Tier VALUES(761,236,3000,0.05000000000000000277);
INSERT INTO Tier VALUES(762,235,4000,0.04000000000000000083);
INSERT INTO Tier VALUES(763,236,4000,0.04000000000000000083);
INSERT INTO Tier VALUES(764,235,5000,0.02500000000000000138);
INSERT INTO Tier VALUES(765,236,5000,0.02500000000000000138);
INSERT INTO Tier VALUES(766,235,10000,0.02000000000000000041);
INSERT INTO Tier VALUES(767,236,10000,0.02000000000000000041);
INSERT INTO Tier VALUES(768,237,500,0.1499999999999999945);
INSERT INTO Tier VALUES(769,238,500,0.1499999999999999945);
INSERT INTO Tier VALUES(770,237,1000,0.1300000000000000044);
INSERT INTO Tier VALUES(771,238,1000,0.1300000000000000044);
INSERT INTO Tier VALUES(772,237,2000,0.08000000000000000166);
INSERT INTO Tier VALUES(773,238,2000,0.08000000000000000166);
INSERT INTO Tier VALUES(774,237,3000,0.05999999999999999778);
INSERT INTO Tier VALUES(775,238,3000,0.05999999999999999778);
INSERT INTO Tier VALUES(776,237,4000,0.05000000000000000277);
INSERT INTO Tier VALUES(777,238,4000,0.05000000000000000277);
INSERT INTO Tier VALUES(778,237,5000,0.04499999999999999834);
INSERT INTO Tier VALUES(779,238,5000,0.04499999999999999834);
INSERT INTO Tier VALUES(780,237,10000,0.03500000000000000334);
INSERT INTO Tier VALUES(781,238,10000,0.03500000000000000334);
INSERT INTO Tier VALUES(782,239,1,35.0);
INSERT INTO Tier VALUES(783,239,10,30.0);
INSERT INTO Tier VALUES(784,239,25,25.0);
INSERT INTO Tier VALUES(785,239,50,17.0);
INSERT INTO Tier VALUES(786,240,1,25.0);
INSERT INTO Tier VALUES(787,240,10,20.0);
INSERT INTO Tier VALUES(788,240,25,15.0);
INSERT INTO Tier VALUES(789,240,50,12.0);
INSERT INTO Tier VALUES(790,241,1,20.0);
INSERT INTO Tier VALUES(791,241,10,15.0);
INSERT INTO Tier VALUES(792,241,25,12.0);
INSERT INTO Tier VALUES(793,241,50,10.0);
INSERT INTO Tier VALUES(794,242,1,2.0);
INSERT INTO Tier VALUES(795,242,10,1.699999999999999956);
INSERT INTO Tier VALUES(796,242,25,1.5);
INSERT INTO Tier VALUES(797,242,50,1.199999999999999956);
INSERT INTO Tier VALUES(798,243,1,42.0);
INSERT INTO Tier VALUES(799,243,10,360.0);
INSERT INTO Tier VALUES(800,243,25,750.0);
INSERT INTO Tier VALUES(801,243,50,1020.0);
INSERT INTO Tier VALUES(802,244,1,30.0);
INSERT INTO Tier VALUES(803,244,10,240.0);
INSERT INTO Tier VALUES(804,244,25,450.0);
INSERT INTO Tier VALUES(805,244,50,720.0);
INSERT INTO Tier VALUES(806,245,1,24.0);
INSERT INTO Tier VALUES(807,245,10,180.0);
INSERT INTO Tier VALUES(808,245,25,360.0);
INSERT INTO Tier VALUES(809,245,50,600.0);
INSERT INTO Tier VALUES(810,246,1,2.399999999999999912);
INSERT INTO Tier VALUES(811,246,10,20.39999999999999857);
INSERT INTO Tier VALUES(812,246,25,45.0);
INSERT INTO Tier VALUES(813,246,50,72.0);
INSERT INTO Tier VALUES(814,247,1,30.0);
INSERT INTO Tier VALUES(815,247,10,264.0);
INSERT INTO Tier VALUES(816,247,25,600.0);
INSERT INTO Tier VALUES(817,247,50,720.0);
INSERT INTO Tier VALUES(818,248,1,20.39999999999999857);
INSERT INTO Tier VALUES(819,248,10,480.0);
INSERT INTO Tier VALUES(820,248,25,300.0);
INSERT INTO Tier VALUES(821,248,50,480.0);
INSERT INTO Tier VALUES(822,249,1,18.0);
INSERT INTO Tier VALUES(823,249,10,420.0);
INSERT INTO Tier VALUES(824,249,25,270.0);
INSERT INTO Tier VALUES(825,249,50,420.0);
INSERT INTO Tier VALUES(826,250,1,1.919999999999999929);
INSERT INTO Tier VALUES(827,250,10,15.0);
INSERT INTO Tier VALUES(828,250,25,30.0);
INSERT INTO Tier VALUES(829,250,50,48.0);
INSERT INTO Tier VALUES(830,251,1,1.5);
INSERT INTO Tier VALUES(831,251,10,1.5);
INSERT INTO Tier VALUES(832,251,25,1.5);
INSERT INTO Tier VALUES(833,251,50,1.5);
INSERT INTO Tier VALUES(834,252,1,1.695000000000000062);
INSERT INTO Tier VALUES(835,252,10,1.695000000000000062);
INSERT INTO Tier VALUES(836,252,25,1.695000000000000062);
INSERT INTO Tier VALUES(837,252,50,1.695000000000000062);
INSERT INTO Tier VALUES(838,253,1,1.995000000000000106);
INSERT INTO Tier VALUES(839,253,10,1.995000000000000106);
INSERT INTO Tier VALUES(840,253,25,1.995000000000000106);
INSERT INTO Tier VALUES(841,253,50,1.995000000000000106);
INSERT INTO Tier VALUES(842,254,1,3.495000000000000106);
INSERT INTO Tier VALUES(843,254,10,3.495000000000000106);
INSERT INTO Tier VALUES(844,254,25,3.495000000000000106);
INSERT INTO Tier VALUES(845,254,50,3.495000000000000106);
INSERT INTO Tier VALUES(846,255,1,1.699999999999999956);
INSERT INTO Tier VALUES(847,255,10,1.699999999999999956);
INSERT INTO Tier VALUES(848,255,25,1.699999999999999956);
INSERT INTO Tier VALUES(849,255,50,1.699999999999999956);
INSERT INTO Tier VALUES(850,256,1,1.92100000000000004);
INSERT INTO Tier VALUES(851,256,10,1.92100000000000004);
INSERT INTO Tier VALUES(852,256,25,1.92100000000000004);
INSERT INTO Tier VALUES(853,256,50,1.92100000000000004);
INSERT INTO Tier VALUES(854,257,1,2.26100000000000012);
INSERT INTO Tier VALUES(855,257,10,2.26100000000000012);
INSERT INTO Tier VALUES(856,257,25,2.26100000000000012);
INSERT INTO Tier VALUES(857,257,50,2.26100000000000012);
INSERT INTO Tier VALUES(858,258,1,3.960999999999999855);
INSERT INTO Tier VALUES(859,258,10,3.960999999999999855);
INSERT INTO Tier VALUES(860,258,25,3.960999999999999855);
INSERT INTO Tier VALUES(861,258,50,3.960999999999999855);
INSERT INTO Tier VALUES(862,259,1,1.899999999999999912);
INSERT INTO Tier VALUES(863,259,10,1.899999999999999912);
INSERT INTO Tier VALUES(864,259,25,1.899999999999999912);
INSERT INTO Tier VALUES(865,259,50,1.899999999999999912);
INSERT INTO Tier VALUES(866,260,1,2.146999999999999797);
INSERT INTO Tier VALUES(867,260,10,2.146999999999999797);
INSERT INTO Tier VALUES(868,260,25,2.146999999999999797);
INSERT INTO Tier VALUES(869,260,50,2.146999999999999797);
INSERT INTO Tier VALUES(870,261,1,2.527000000000000135);
INSERT INTO Tier VALUES(871,261,10,2.527000000000000135);
INSERT INTO Tier VALUES(872,261,25,2.527000000000000135);
INSERT INTO Tier VALUES(873,261,50,2.527000000000000135);
INSERT INTO Tier VALUES(874,262,1,4.426999999999999602);
INSERT INTO Tier VALUES(875,262,10,4.426999999999999602);
INSERT INTO Tier VALUES(876,262,25,4.426999999999999602);
INSERT INTO Tier VALUES(877,262,50,4.426999999999999602);
INSERT INTO Tier VALUES(878,263,1,1.0);
INSERT INTO Tier VALUES(879,263,10,1.0);
INSERT INTO Tier VALUES(880,263,25,1.0);
INSERT INTO Tier VALUES(881,263,50,1.0);
INSERT INTO Tier VALUES(882,264,1,1.129999999999999893);
INSERT INTO Tier VALUES(883,264,10,1.129999999999999893);
INSERT INTO Tier VALUES(884,264,25,1.129999999999999893);
INSERT INTO Tier VALUES(885,264,50,1.129999999999999893);
INSERT INTO Tier VALUES(886,265,1,1.330000000000000071);
INSERT INTO Tier VALUES(887,265,10,1.330000000000000071);
INSERT INTO Tier VALUES(888,265,25,1.330000000000000071);
INSERT INTO Tier VALUES(889,265,50,1.330000000000000071);
INSERT INTO Tier VALUES(890,266,1,2.330000000000000071);
INSERT INTO Tier VALUES(891,266,10,2.330000000000000071);
INSERT INTO Tier VALUES(892,266,25,2.330000000000000071);
INSERT INTO Tier VALUES(893,266,50,2.330000000000000071);
INSERT INTO Tier VALUES(894,267,1,1.199999999999999956);
INSERT INTO Tier VALUES(895,267,10,1.199999999999999956);
INSERT INTO Tier VALUES(896,267,25,1.199999999999999956);
INSERT INTO Tier VALUES(897,267,50,1.199999999999999956);
INSERT INTO Tier VALUES(898,268,1,1.356000000000000094);
INSERT INTO Tier VALUES(899,268,10,1.356000000000000094);
INSERT INTO Tier VALUES(900,268,25,1.356000000000000094);
INSERT INTO Tier VALUES(901,268,50,1.356000000000000094);
INSERT INTO Tier VALUES(902,269,1,1.596000000000000085);
INSERT INTO Tier VALUES(903,269,10,1.596000000000000085);
INSERT INTO Tier VALUES(904,269,25,1.596000000000000085);
INSERT INTO Tier VALUES(905,269,50,1.596000000000000085);
INSERT INTO Tier VALUES(906,270,1,2.795999999999999819);
INSERT INTO Tier VALUES(907,270,10,2.795999999999999819);
INSERT INTO Tier VALUES(908,270,25,2.795999999999999819);
INSERT INTO Tier VALUES(909,270,50,2.795999999999999819);
INSERT INTO Tier VALUES(910,271,1,1.399999999999999912);
INSERT INTO Tier VALUES(911,271,10,1.399999999999999912);
INSERT INTO Tier VALUES(912,271,25,1.399999999999999912);
INSERT INTO Tier VALUES(913,271,50,1.399999999999999912);
INSERT INTO Tier VALUES(914,272,1,1.582000000000000072);
INSERT INTO Tier VALUES(915,272,10,1.582000000000000072);
INSERT INTO Tier VALUES(916,272,25,1.582000000000000072);
INSERT INTO Tier VALUES(917,272,50,1.582000000000000072);
INSERT INTO Tier VALUES(918,273,1,1.862000000000000099);
INSERT INTO Tier VALUES(919,273,10,1.862000000000000099);
INSERT INTO Tier VALUES(920,273,25,1.862000000000000099);
INSERT INTO Tier VALUES(921,273,50,1.862000000000000099);
INSERT INTO Tier VALUES(922,274,1,3.26200000000000001);
INSERT INTO Tier VALUES(923,274,10,3.26200000000000001);
INSERT INTO Tier VALUES(924,274,25,3.26200000000000001);
INSERT INTO Tier VALUES(925,274,50,3.26200000000000001);
INSERT INTO Tier VALUES(926,275,1,0.5);
INSERT INTO Tier VALUES(927,275,10,0.5);
INSERT INTO Tier VALUES(928,275,25,0.5);
INSERT INTO Tier VALUES(929,275,50,0.5);
INSERT INTO Tier VALUES(930,276,1,0.5649999999999999467);
INSERT INTO Tier VALUES(931,276,10,0.5649999999999999467);
INSERT INTO Tier VALUES(932,276,25,0.5649999999999999467);
INSERT INTO Tier VALUES(933,276,50,0.5649999999999999467);
INSERT INTO Tier VALUES(934,277,1,0.6650000000000000355);
INSERT INTO Tier VALUES(935,277,10,0.6650000000000000355);
INSERT INTO Tier VALUES(936,277,25,0.6650000000000000355);
INSERT INTO Tier VALUES(937,277,50,0.6650000000000000355);
INSERT INTO Tier VALUES(938,278,1,1.165000000000000035);
INSERT INTO Tier VALUES(939,278,10,1.165000000000000035);
INSERT INTO Tier VALUES(940,278,25,1.165000000000000035);
INSERT INTO Tier VALUES(941,278,50,1.165000000000000035);
INSERT INTO Tier VALUES(942,279,1,0.6999999999999999556);
INSERT INTO Tier VALUES(943,279,10,0.6999999999999999556);
INSERT INTO Tier VALUES(944,279,25,0.6999999999999999556);
INSERT INTO Tier VALUES(945,279,50,0.6999999999999999556);
INSERT INTO Tier VALUES(946,280,1,0.7909999999999999253);
INSERT INTO Tier VALUES(947,280,10,0.7909999999999999253);
INSERT INTO Tier VALUES(948,280,25,0.7909999999999999253);
INSERT INTO Tier VALUES(949,280,50,0.7909999999999999253);
INSERT INTO Tier VALUES(950,281,1,0.930999999999999939);
INSERT INTO Tier VALUES(951,281,10,0.930999999999999939);
INSERT INTO Tier VALUES(952,281,25,0.930999999999999939);
INSERT INTO Tier VALUES(953,281,50,0.930999999999999939);
INSERT INTO Tier VALUES(954,282,1,1.631000000000000005);
INSERT INTO Tier VALUES(955,282,10,1.631000000000000005);
INSERT INTO Tier VALUES(956,282,25,1.631000000000000005);
INSERT INTO Tier VALUES(957,282,50,1.631000000000000005);
INSERT INTO Tier VALUES(958,283,1,1.0);
INSERT INTO Tier VALUES(959,283,10,1.0);
INSERT INTO Tier VALUES(960,283,25,1.0);
INSERT INTO Tier VALUES(961,283,50,1.0);
INSERT INTO Tier VALUES(962,284,1,1.129999999999999893);
INSERT INTO Tier VALUES(963,284,10,1.129999999999999893);
INSERT INTO Tier VALUES(964,284,25,1.129999999999999893);
INSERT INTO Tier VALUES(965,284,50,1.129999999999999893);
INSERT INTO Tier VALUES(966,285,1,1.330000000000000071);
INSERT INTO Tier VALUES(967,285,10,1.330000000000000071);
INSERT INTO Tier VALUES(968,285,25,1.330000000000000071);
INSERT INTO Tier VALUES(969,285,50,1.330000000000000071);
INSERT INTO Tier VALUES(970,286,1,2.330000000000000071);
INSERT INTO Tier VALUES(971,286,10,2.330000000000000071);
INSERT INTO Tier VALUES(972,286,25,2.330000000000000071);
INSERT INTO Tier VALUES(973,286,50,2.330000000000000071);
INSERT INTO Tier VALUES(974,287,1,1.199999999999999956);
INSERT INTO Tier VALUES(975,287,10,1.199999999999999956);
INSERT INTO Tier VALUES(976,287,25,1.199999999999999956);
INSERT INTO Tier VALUES(977,287,50,1.199999999999999956);
INSERT INTO Tier VALUES(978,288,1,1.356000000000000094);
INSERT INTO Tier VALUES(979,288,10,1.356000000000000094);
INSERT INTO Tier VALUES(980,288,25,1.356000000000000094);
INSERT INTO Tier VALUES(981,288,50,1.356000000000000094);
INSERT INTO Tier VALUES(982,289,1,1.596000000000000085);
INSERT INTO Tier VALUES(983,289,10,1.596000000000000085);
INSERT INTO Tier VALUES(984,289,25,1.596000000000000085);
INSERT INTO Tier VALUES(985,289,50,1.596000000000000085);
INSERT INTO Tier VALUES(986,290,1,2.795999999999999819);
INSERT INTO Tier VALUES(987,290,10,2.795999999999999819);
INSERT INTO Tier VALUES(988,290,25,2.795999999999999819);
INSERT INTO Tier VALUES(989,290,50,2.795999999999999819);
INSERT INTO Tier VALUES(990,291,1,2.0);
INSERT INTO Tier VALUES(991,291,10,2.0);
INSERT INTO Tier VALUES(992,291,25,2.0);
INSERT INTO Tier VALUES(993,291,50,2.0);
INSERT INTO Tier VALUES(994,292,1,2.259999999999999786);
INSERT INTO Tier VALUES(995,292,10,2.259999999999999786);
INSERT INTO Tier VALUES(996,292,25,2.259999999999999786);
INSERT INTO Tier VALUES(997,292,50,2.259999999999999786);
INSERT INTO Tier VALUES(998,293,1,2.660000000000000142);
INSERT INTO Tier VALUES(999,293,10,2.660000000000000142);
INSERT INTO Tier VALUES(1000,293,25,2.660000000000000142);
INSERT INTO Tier VALUES(1001,293,50,2.660000000000000142);
INSERT INTO Tier VALUES(1002,294,1,4.660000000000000142);
INSERT INTO Tier VALUES(1003,294,10,4.660000000000000142);
INSERT INTO Tier VALUES(1004,294,25,4.660000000000000142);
INSERT INTO Tier VALUES(1005,294,50,4.660000000000000142);
INSERT INTO Tier VALUES(1006,295,1,2.200000000000000178);
INSERT INTO Tier VALUES(1007,295,10,2.200000000000000178);
INSERT INTO Tier VALUES(1008,295,25,2.200000000000000178);
INSERT INTO Tier VALUES(1009,295,50,2.200000000000000178);
INSERT INTO Tier VALUES(1010,296,1,2.486000000000000209);
INSERT INTO Tier VALUES(1011,296,10,2.486000000000000209);
INSERT INTO Tier VALUES(1012,296,25,2.486000000000000209);
INSERT INTO Tier VALUES(1013,296,50,2.486000000000000209);
INSERT INTO Tier VALUES(1014,297,1,2.926000000000001044);
INSERT INTO Tier VALUES(1015,297,10,2.926000000000001044);
INSERT INTO Tier VALUES(1016,297,25,2.926000000000001044);
INSERT INTO Tier VALUES(1017,297,50,2.926000000000001044);
INSERT INTO Tier VALUES(1018,298,1,5.126000000000000333);
INSERT INTO Tier VALUES(1019,298,10,5.126000000000000333);
INSERT INTO Tier VALUES(1020,298,25,5.126000000000000333);
INSERT INTO Tier VALUES(1021,298,50,5.126000000000000333);
INSERT INTO Tier VALUES(1022,299,1,0.25);
INSERT INTO Tier VALUES(1023,299,10,0.25);
INSERT INTO Tier VALUES(1024,299,25,0.25);
INSERT INTO Tier VALUES(1025,299,50,0.25);
INSERT INTO Tier VALUES(1026,300,1,0.2824999999999999733);
INSERT INTO Tier VALUES(1027,300,10,0.2824999999999999733);
INSERT INTO Tier VALUES(1028,300,25,0.2824999999999999733);
INSERT INTO Tier VALUES(1029,300,50,0.2824999999999999733);
INSERT INTO Tier VALUES(1030,301,1,0.3325000000000000177);
INSERT INTO Tier VALUES(1031,301,10,0.3325000000000000177);
INSERT INTO Tier VALUES(1032,301,25,0.3325000000000000177);
INSERT INTO Tier VALUES(1033,301,50,0.3325000000000000177);
INSERT INTO Tier VALUES(1034,302,1,0.5825000000000000177);
INSERT INTO Tier VALUES(1035,302,10,0.5825000000000000177);
INSERT INTO Tier VALUES(1036,302,25,0.5825000000000000177);
INSERT INTO Tier VALUES(1037,302,50,0.5825000000000000177);
INSERT INTO Tier VALUES(1038,303,1,0.3499999999999999778);
INSERT INTO Tier VALUES(1039,303,10,0.3499999999999999778);
INSERT INTO Tier VALUES(1040,303,25,0.3499999999999999778);
INSERT INTO Tier VALUES(1041,303,50,0.3499999999999999778);
INSERT INTO Tier VALUES(1042,304,1,0.3955000000000000182);
INSERT INTO Tier VALUES(1043,304,10,0.3955000000000000182);
INSERT INTO Tier VALUES(1044,304,25,0.3955000000000000182);
INSERT INTO Tier VALUES(1045,304,50,0.3955000000000000182);
INSERT INTO Tier VALUES(1046,305,1,0.4655000000000000248);
INSERT INTO Tier VALUES(1047,305,10,0.4655000000000000248);
INSERT INTO Tier VALUES(1048,305,25,0.4655000000000000248);
INSERT INTO Tier VALUES(1049,305,50,0.4655000000000000248);
INSERT INTO Tier VALUES(1050,306,1,0.8155000000000000026);
INSERT INTO Tier VALUES(1051,306,10,0.8155000000000000026);
INSERT INTO Tier VALUES(1052,306,25,0.8155000000000000026);
INSERT INTO Tier VALUES(1053,306,50,0.8155000000000000026);
INSERT INTO Tier VALUES(1054,307,1,0.5);
INSERT INTO Tier VALUES(1055,307,10,0.5);
INSERT INTO Tier VALUES(1056,307,25,0.5);
INSERT INTO Tier VALUES(1057,307,50,0.5);
INSERT INTO Tier VALUES(1058,308,1,0.5649999999999999467);
INSERT INTO Tier VALUES(1059,308,10,0.5649999999999999467);
INSERT INTO Tier VALUES(1060,308,25,0.5649999999999999467);
INSERT INTO Tier VALUES(1061,308,50,0.5649999999999999467);
INSERT INTO Tier VALUES(1062,309,1,0.6650000000000000355);
INSERT INTO Tier VALUES(1063,309,10,0.6650000000000000355);
INSERT INTO Tier VALUES(1064,309,25,0.6650000000000000355);
INSERT INTO Tier VALUES(1065,309,50,0.6650000000000000355);
INSERT INTO Tier VALUES(1066,310,1,1.165000000000000035);
INSERT INTO Tier VALUES(1067,310,10,1.165000000000000035);
INSERT INTO Tier VALUES(1068,310,25,1.165000000000000035);
INSERT INTO Tier VALUES(1069,310,50,1.165000000000000035);
INSERT INTO Tier VALUES(1070,311,1,0.5999999999999999778);
INSERT INTO Tier VALUES(1071,311,10,0.5999999999999999778);
INSERT INTO Tier VALUES(1072,311,25,0.5999999999999999778);
INSERT INTO Tier VALUES(1073,311,50,0.5999999999999999778);
INSERT INTO Tier VALUES(1074,312,1,0.677999999999999936);
INSERT INTO Tier VALUES(1075,312,10,0.677999999999999936);
INSERT INTO Tier VALUES(1076,312,25,0.677999999999999936);
INSERT INTO Tier VALUES(1077,312,50,0.677999999999999936);
INSERT INTO Tier VALUES(1078,313,1,0.7980000000000000426);
INSERT INTO Tier VALUES(1079,313,10,0.7980000000000000426);
INSERT INTO Tier VALUES(1080,313,25,0.7980000000000000426);
INSERT INTO Tier VALUES(1081,313,50,0.7980000000000000426);
INSERT INTO Tier VALUES(1082,314,1,1.39799999999999991);
INSERT INTO Tier VALUES(1083,314,10,1.39799999999999991);
INSERT INTO Tier VALUES(1084,314,25,1.39799999999999991);
INSERT INTO Tier VALUES(1085,314,50,1.39799999999999991);
INSERT INTO Tier VALUES(1086,315,1,1.0);
INSERT INTO Tier VALUES(1087,315,10,1.0);
INSERT INTO Tier VALUES(1088,315,25,1.0);
INSERT INTO Tier VALUES(1089,315,50,1.0);
INSERT INTO Tier VALUES(1090,316,1,1.129999999999999893);
INSERT INTO Tier VALUES(1091,316,10,1.129999999999999893);
INSERT INTO Tier VALUES(1092,316,25,1.129999999999999893);
INSERT INTO Tier VALUES(1093,316,50,1.129999999999999893);
INSERT INTO Tier VALUES(1094,317,1,1.330000000000000071);
INSERT INTO Tier VALUES(1095,317,10,1.330000000000000071);
INSERT INTO Tier VALUES(1096,317,25,1.330000000000000071);
INSERT INTO Tier VALUES(1097,317,50,1.330000000000000071);
INSERT INTO Tier VALUES(1098,318,1,2.330000000000000071);
INSERT INTO Tier VALUES(1099,318,10,2.330000000000000071);
INSERT INTO Tier VALUES(1100,318,25,2.330000000000000071);
INSERT INTO Tier VALUES(1101,318,50,2.330000000000000071);
INSERT INTO Tier VALUES(1102,319,1,1.100000000000000089);
INSERT INTO Tier VALUES(1103,319,10,1.100000000000000089);
INSERT INTO Tier VALUES(1104,319,25,1.100000000000000089);
INSERT INTO Tier VALUES(1105,319,50,1.100000000000000089);
INSERT INTO Tier VALUES(1106,320,1,1.243000000000000104);
INSERT INTO Tier VALUES(1107,320,10,1.243000000000000104);
INSERT INTO Tier VALUES(1108,320,25,1.243000000000000104);
INSERT INTO Tier VALUES(1109,320,50,1.243000000000000104);
INSERT INTO Tier VALUES(1110,321,1,1.463000000000000078);
INSERT INTO Tier VALUES(1111,321,10,1.463000000000000078);
INSERT INTO Tier VALUES(1112,321,25,1.463000000000000078);
INSERT INTO Tier VALUES(1113,321,50,1.463000000000000078);
INSERT INTO Tier VALUES(1114,322,1,2.563000000000000166);
INSERT INTO Tier VALUES(1115,322,10,2.563000000000000166);
INSERT INTO Tier VALUES(1116,322,25,2.563000000000000166);
INSERT INTO Tier VALUES(1117,322,50,2.563000000000000166);
INSERT INTO Tier VALUES(1118,323,300,195.0);
INSERT INTO Tier VALUES(1119,323,500,275.0);
INSERT INTO Tier VALUES(1120,323,1000,400.0);
INSERT INTO Tier VALUES(1121,323,5000,1000.0);
INSERT INTO Tier VALUES(1122,324,300,225.0);
INSERT INTO Tier VALUES(1123,324,500,325.0);
INSERT INTO Tier VALUES(1124,324,1000,500.0);
INSERT INTO Tier VALUES(1125,324,5000,1250.0);
INSERT INTO Tier VALUES(1126,325,300,240.0);
INSERT INTO Tier VALUES(1127,325,500,375.0);
INSERT INTO Tier VALUES(1128,325,1000,700.0);
INSERT INTO Tier VALUES(1129,325,5000,1350.0);
INSERT INTO Tier VALUES(1130,326,300,120.0);
INSERT INTO Tier VALUES(1131,326,500,175.0);
INSERT INTO Tier VALUES(1132,326,1000,250.0);
INSERT INTO Tier VALUES(1133,326,5000,750.0);
INSERT INTO Tier VALUES(1134,327,300,135.0);
INSERT INTO Tier VALUES(1135,327,500,225.0);
INSERT INTO Tier VALUES(1136,327,1000,350.0);
INSERT INTO Tier VALUES(1137,327,5000,850.0);
INSERT INTO Tier VALUES(1138,328,100,1.600000000000000088);
INSERT INTO Tier VALUES(1139,329,100,2.040000000000000035);
INSERT INTO Tier VALUES(1140,330,100,2.560000000000000053);
INSERT INTO Tier VALUES(1141,331,100,3.0);
INSERT INTO Tier VALUES(1142,332,100,3.359999999999999876);
INSERT INTO Tier VALUES(1143,333,100,3.919999999999999929);
INSERT INTO Tier VALUES(1144,334,100,4.320000000000000285);
INSERT INTO Tier VALUES(1145,335,100,4.679999999999999716);
INSERT INTO Tier VALUES(1146,336,100,5.200000000000000177);
INSERT INTO Tier VALUES(1147,337,100,5.72000000000000064);
INSERT INTO Tier VALUES(1148,338,100,6.240000000000000213);
INSERT INTO Tier VALUES(1149,339,100,6.759999999999999787);
INSERT INTO Tier VALUES(1150,340,100,7.280000000000000248);
INSERT INTO Tier VALUES(1151,341,100,7.199999999999999289);
INSERT INTO Tier VALUES(1152,342,100,8.320000000000000284);
INSERT INTO Tier VALUES(1153,343,100,8.839999999999999858);
INSERT INTO Tier VALUES(1154,344,100,0.8000000000000000444);
INSERT INTO Tier VALUES(1155,345,100,1.080000000000000072);
INSERT INTO Tier VALUES(1156,346,100,1.439999999999999947);
INSERT INTO Tier VALUES(1157,347,100,1.600000000000000088);
INSERT INTO Tier VALUES(1158,348,100,1.919999999999999929);
INSERT INTO Tier VALUES(1159,349,100,2.240000000000000214);
INSERT INTO Tier VALUES(1160,350,100,2.560000000000000053);
INSERT INTO Tier VALUES(1161,351,100,2.879999999999999894);
INSERT INTO Tier VALUES(1162,352,100,3.200000000000000177);
INSERT INTO Tier VALUES(1163,353,100,3.520000000000000017);
INSERT INTO Tier VALUES(1164,354,100,3.839999999999999858);
INSERT INTO Tier VALUES(1165,355,100,4.160000000000000142);
INSERT INTO Tier VALUES(1166,356,100,4.480000000000000427);
INSERT INTO Tier VALUES(1167,357,100,4.799999999999999823);
INSERT INTO Tier VALUES(1168,358,100,5.120000000000000106);
INSERT INTO Tier VALUES(1169,359,100,5.44000000000000039);
INSERT INTO Tier VALUES(1170,360,100,0.4799999999999999823);
INSERT INTO Tier VALUES(1171,361,100,0.7199999999999999734);
INSERT INTO Tier VALUES(1172,362,100,0.959999999999999965);
INSERT INTO Tier VALUES(1173,363,100,1.199999999999999956);
INSERT INTO Tier VALUES(1174,364,100,1.439999999999999947);
INSERT INTO Tier VALUES(1175,365,100,1.679999999999999938);
INSERT INTO Tier VALUES(1176,366,100,1.919999999999999929);
INSERT INTO Tier VALUES(1177,367,100,2.160000000000000143);
INSERT INTO Tier VALUES(1178,368,100,2.399999999999999912);
INSERT INTO Tier VALUES(1179,369,100,2.640000000000000124);
INSERT INTO Tier VALUES(1180,370,100,2.399999999999999912);
INSERT INTO Tier VALUES(1181,371,100,2.080000000000000071);
INSERT INTO Tier VALUES(1182,372,100,3.359999999999999876);
INSERT INTO Tier VALUES(1183,373,100,3.600000000000000088);
INSERT INTO Tier VALUES(1184,374,10,2.0);
INSERT INTO Tier VALUES(1185,375,10,3.0);
INSERT INTO Tier VALUES(1186,376,10,4.0);
INSERT INTO Tier VALUES(1187,377,10,5.0);
INSERT INTO Tier VALUES(1188,378,10,6.0);
INSERT INTO Tier VALUES(1189,379,10,7.0);
INSERT INTO Tier VALUES(1190,380,10,8.0);
INSERT INTO Tier VALUES(1191,381,10,9.0);
INSERT INTO Tier VALUES(1192,382,10,10.0);
INSERT INTO Tier VALUES(1193,383,10,10.56000000000000049);
INSERT INTO Tier VALUES(1194,384,10,11.51999999999999958);
INSERT INTO Tier VALUES(1195,385,10,12.48000000000000042);
INSERT INTO Tier VALUES(1196,386,10,13.43999999999999951);
INSERT INTO Tier VALUES(1197,387,10,14.40000000000000035);
INSERT INTO Tier VALUES(1198,388,10,15.35999999999999944);
INSERT INTO Tier VALUES(1199,389,10,16.32000000000000028);
INSERT INTO Tier VALUES(1200,390,10,1.360000000000000097);
INSERT INTO Tier VALUES(1201,391,10,2.040000000000000035);
INSERT INTO Tier VALUES(1202,392,10,2.720000000000000195);
INSERT INTO Tier VALUES(1203,393,10,3.399999999999999912);
INSERT INTO Tier VALUES(1204,394,10,4.080000000000000071);
INSERT INTO Tier VALUES(1205,395,10,4.760000000000000676);
INSERT INTO Tier VALUES(1206,396,10,5.44000000000000039);
INSERT INTO Tier VALUES(1207,397,10,6.120000000000000106);
INSERT INTO Tier VALUES(1208,398,10,6.800000000000000711);
INSERT INTO Tier VALUES(1209,399,10,6.72000000000000064);
INSERT INTO Tier VALUES(1210,400,10,8.839999999999999858);
INSERT INTO Tier VALUES(1211,401,10,9.52000000000000135);
INSERT INTO Tier VALUES(1212,402,10,10.88000000000000079);
INSERT INTO Tier VALUES(1213,403,10,10.19999999999999928);
INSERT INTO Tier VALUES(1214,404,10,11.56000000000000049);
INSERT INTO Tier VALUES(1215,405,10,0.959999999999999965);
INSERT INTO Tier VALUES(1216,406,10,1.439999999999999947);
INSERT INTO Tier VALUES(1217,407,10,1.919999999999999929);
INSERT INTO Tier VALUES(1218,408,10,2.399999999999999912);
INSERT INTO Tier VALUES(1219,409,10,2.879999999999999894);
INSERT INTO Tier VALUES(1220,410,10,3.359999999999999876);
INSERT INTO Tier VALUES(1221,411,10,3.839999999999999858);
INSERT INTO Tier VALUES(1222,412,10,3.959999999999999965);
INSERT INTO Tier VALUES(1223,413,10,4.799999999999999823);
INSERT INTO Tier VALUES(1224,414,10,5.27999999999999936);
INSERT INTO Tier VALUES(1225,415,10,4.800000000000000711);
INSERT INTO Tier VALUES(1226,416,10,6.240000000000000213);
INSERT INTO Tier VALUES(1227,417,10,6.719999999999999752);
INSERT INTO Tier VALUES(1228,418,10,5.399999999999998579);
INSERT INTO Tier VALUES(1229,403,10,7.199999999999999289);
INSERT INTO Tier VALUES(1230,404,10,8.160000000000000142);
INSERT INTO Tier VALUES(1231,419,50,0.949999999999999956);
INSERT INTO Tier VALUES(1232,419,100,0.8000000000000000444);
INSERT INTO Tier VALUES(1233,419,250,0.75);
INSERT INTO Tier VALUES(1234,419,500,0.6500000000000000222);
INSERT INTO Tier VALUES(1235,419,1000,0.5);
INSERT INTO Tier VALUES(1236,419,5000,0.2000000000000000111);
INSERT INTO Tier VALUES(1237,419,10000,0.1499999999999999945);
INSERT INTO Tier VALUES(1238,420,1,1.25);
INSERT INTO Tier VALUES(1239,420,50,0.5999999999999999778);
INSERT INTO Tier VALUES(1240,420,100,0.5);
INSERT INTO Tier VALUES(1241,420,250,0.4000000000000000222);
INSERT INTO Tier VALUES(1242,420,500,0.2999999999999999889);
INSERT INTO Tier VALUES(1243,420,1000,0.25);
INSERT INTO Tier VALUES(1244,420,5000,0.1499999999999999945);
INSERT INTO Tier VALUES(1245,420,10000,0.1100000000000000005);
INSERT INTO Tier VALUES(1246,421,1,0.4000000000000000222);
INSERT INTO Tier VALUES(1247,421,50,0.3499999999999999778);
INSERT INTO Tier VALUES(1248,421,100,0.2999999999999999889);
INSERT INTO Tier VALUES(1249,421,250,0.25);
INSERT INTO Tier VALUES(1250,421,500,0.2000000000000000111);
INSERT INTO Tier VALUES(1251,421,1000,0.1400000000000000134);
INSERT INTO Tier VALUES(1252,421,5000,0.1199999999999999956);
INSERT INTO Tier VALUES(1253,421,10000,0.1000000000000000055);
INSERT INTO Tier VALUES(1254,422,1,0.2000000000000000111);
INSERT INTO Tier VALUES(1255,422,100,0.1300000000000000044);
INSERT INTO Tier VALUES(1256,422,250,0.1000000000000000055);
INSERT INTO Tier VALUES(1257,422,500,0.08999999999999999667);
INSERT INTO Tier VALUES(1258,422,1000,0.08000000000000000166);
INSERT INTO Tier VALUES(1259,422,5000,0.07000000000000000667);
INSERT INTO Tier VALUES(1260,422,10000,0.05999999999999999778);
INSERT INTO Tier VALUES(1261,423,1,35.0);
INSERT INTO Tier VALUES(1262,424,1,25.0);
INSERT INTO Tier VALUES(1263,425,1,20.0);
INSERT INTO Tier VALUES(1264,426,1,10.0);
INSERT INTO Tier VALUES(1265,427,1,6.0);
INSERT INTO Tier VALUES(1266,428,1,3.5);
INSERT INTO Tier VALUES(1267,429,1,7.0);
INSERT INTO Tier VALUES(1268,430,1,4.0);
INSERT INTO Tier VALUES(1269,431,1,3.0);
INSERT INTO Tier VALUES(1270,432,20,0.5);
INSERT INTO Tier VALUES(1271,433,20,0.6999999999999999556);
INSERT INTO Tier VALUES(1272,434,100,0.5999999999999999778);
INSERT INTO Tier VALUES(1273,435,100,0.8000000000000000444);
INSERT INTO Tier VALUES(1274,436,50,1.5);
INSERT INTO Tier VALUES(1275,437,50,2.0);
INSERT INTO Tier VALUES(1276,438,50,2.200000000000000178);
INSERT INTO Tier VALUES(1277,439,50,2.399999999999999912);
INSERT INTO Tier VALUES(1278,440,50,2.5);
INSERT INTO Tier VALUES(1279,441,50,2.600000000000000088);
INSERT INTO Tier VALUES(1280,442,100,0.2999999999999999889);
INSERT INTO Tier VALUES(1281,443,200,0.2999999999999999889);
INSERT INTO Tier VALUES(1282,444,200,0.5);
INSERT INTO Tier VALUES(1283,445,200,0.2000000000000000111);
INSERT INTO Tier VALUES(1284,446,1,12.0);
INSERT INTO Tier VALUES(1285,447,1,8.0);
INSERT INTO Tier VALUES(1286,448,100,0.4000000000000000222);
INSERT INTO Tier VALUES(1287,449,20,0.6999999999999999556);
INSERT INTO Tier VALUES(1288,450,20,0.9000000000000000222);
INSERT INTO Tier VALUES(1289,451,20,1.100000000000000089);
INSERT INTO Tier VALUES(1290,452,20,1.199999999999999956);
INSERT INTO Tier VALUES(1291,453,20,1.0);
INSERT INTO Tier VALUES(1292,454,20,0.949999999999999956);
INSERT INTO Tier VALUES(1293,455,20,1.199999999999999956);
INSERT INTO Tier VALUES(1377,460,1,3.0);
INSERT INTO Tier VALUES(1378,461,1,5.0);
INSERT INTO Tier VALUES(1379,462,1,15.0);
INSERT INTO Tier VALUES(1380,463,1,20.0);
INSERT INTO Tier VALUES(1381,464,1,5.0);
INSERT INTO Tier VALUES(1382,465,1,3.5);
INSERT INTO Tier VALUES(1383,466,1,0.05000000000000000277);
INSERT INTO Tier VALUES(1384,467,1000,0.01200000000000000024);
INSERT INTO Tier VALUES(1385,468,1000,0.006000000000000000124);
INSERT INTO Tier VALUES(1386,469,1,2.0);
INSERT INTO Tier VALUES(1387,470,1,0.05000000000000000277);
CREATE TABLE IF NOT EXISTS "ChangeHistory" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "serviceId" INTEGER NOT NULL,
    "rowId" INTEGER,
    "changeType" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "oldData" TEXT,
    "newData" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "ChangeHistory_rowId_fkey" FOREIGN KEY ("rowId") REFERENCES "PriceRow" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "ChangeHistory_serviceId_fkey" FOREIGN KEY ("serviceId") REFERENCES "Service" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
CREATE TABLE IF NOT EXISTS "Account" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "providerAccountId" TEXT NOT NULL,
    "refresh_token" TEXT,
    "access_token" TEXT,
    "expires_at" INTEGER,
    "token_type" TEXT,
    "scope" TEXT,
    "id_token" TEXT,
    "session_state" TEXT,
    CONSTRAINT "Account_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
CREATE TABLE IF NOT EXISTS "Session" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "sessionToken" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "expires" DATETIME NOT NULL,
    CONSTRAINT "Session_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
CREATE TABLE IF NOT EXISTS "User" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT,
    "email" TEXT NOT NULL,
    "emailVerified" DATETIME,
    "image" TEXT
);
CREATE TABLE IF NOT EXISTS "VerificationToken" (
    "identifier" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "expires" DATETIME NOT NULL
);
CREATE TABLE IF NOT EXISTS "Order" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "orderNumber" TEXT NOT NULL,
    "customerName" TEXT NOT NULL,
    "customerEmail" TEXT NOT NULL,
    "customerPhone" TEXT,
    "totalAmount" REAL NOT NULL,
    "status" TEXT NOT NULL,
    "paymentMethod" TEXT NOT NULL,
    "deliveryDate" DATETIME NOT NULL,
    "specialInstructions" TEXT,
    "deliveryAddress" TEXT,
    "deliveryCity" TEXT,
    "deliveryPostcode" TEXT,
    "deliveryCountry" TEXT DEFAULT 'UK',
    "deliveryContactName" TEXT,
    "deliveryContactPhone" TEXT,
    "deliveryCost" REAL DEFAULT 15.0,
    "userId" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Order_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
CREATE TABLE IF NOT EXISTS "OrderItem" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "orderId" INTEGER NOT NULL,
    "serviceName" TEXT NOT NULL,
    "serviceSlug" TEXT NOT NULL,
    "parameters" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL,
    "unitPrice" REAL NOT NULL,
    "totalPrice" REAL NOT NULL,
    "fileName" TEXT,
    "fileSize" INTEGER,
    "filePath" TEXT,
    "notes" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "OrderItem_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
CREATE TABLE IF NOT EXISTS "Invoice" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "orderId" INTEGER NOT NULL,
    "invoiceNumber" TEXT NOT NULL,
    "invoiceDate" TEXT NOT NULL,
    "taxPoint" TEXT NOT NULL,
    "billTo" TEXT NOT NULL,
    "paymentTerms" TEXT NOT NULL,
    "items" JSONB NOT NULL,
    "subtotal" REAL NOT NULL,
    "discount" REAL NOT NULL DEFAULT 0,
    "discountType" TEXT,
    "vatRate" REAL NOT NULL DEFAULT 20,
    "vatAmount" REAL NOT NULL,
    "total" REAL NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'draft',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Invoice_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
CREATE TABLE IF NOT EXISTS "MenuTile" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "label" TEXT NOT NULL,
    "href" TEXT NOT NULL,
    "image" TEXT,
    "order" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO MenuTile VALUES(1,'Business Cards','/services/business-card-printing','/uploads/services/business-cards.jpg',1,1,1758561790284,1758561790284);
INSERT INTO MenuTile VALUES(2,'Flyers','/services/flyers','/uploads/services/flyers.jpg',2,1,1758561790284,1758561790284);
CREATE TABLE IF NOT EXISTS "WhyArticle" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "title" TEXT NOT NULL,
    "text" TEXT NOT NULL,
    "image" TEXT,
    "href" TEXT,
    "span" TEXT,
    "order" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "content" TEXT,
    "images" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO WhyArticle VALUES(1,'Why Choose Us?','We provide high-quality printing services with fast turnaround times.','/uploads/why-articles/why-article-1758398492704.jpg','/about','xl',1,1,NULL,NULL,1758561790286,1758570835746);
INSERT INTO WhyArticle VALUES(2,'Fast Delivery','Get your prints delivered quickly with our express service.','/uploads/why-articles/why-article-1758398602306.jpg','/delivery','',2,1,NULL,NULL,1758561790286,1758570839814);
CREATE TABLE IF NOT EXISTS "Settings" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "key" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "description" TEXT,
    "category" TEXT NOT NULL DEFAULT 'general',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
CREATE TABLE IF NOT EXISTS "SearchLog" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "query" TEXT NOT NULL,
    "resultsCount" INTEGER NOT NULL DEFAULT 0,
    "userAgent" TEXT,
    "ip" TEXT,
    "timestamp" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);
INSERT INTO SearchLog VALUES(1,'business cards',2,'test','127.0.0.1','2025-09-22 17:45:35');
INSERT INTO SearchLog VALUES(2,'test query',1,'test','127.0.0.1',1758563200339);
INSERT INTO SearchLog VALUES(3,'dig',0,'Mozilla/5.0 (iPhone; CPU iPhone OS 16_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.6 Mobile/15E148 Safari/604.1','',1758567810216);
INSERT INTO SearchLog VALUES(4,'dig',1,'Mozilla/5.0 (iPhone; CPU iPhone OS 16_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.6 Mobile/15E148 Safari/604.1','',1758567811448);
INSERT INTO SearchLog VALUES(5,'dig',1,'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36','',1758568133438);
INSERT INTO SearchLog VALUES(6,'dig',0,'','',1758568532460);
INSERT INTO SearchLog VALUES(7,'test',0,'','',1758568587841);
INSERT INTO SearchLog VALUES(8,'dig',0,'','',1758568611728);
INSERT INTO SearchLog VALUES(9,'digi',0,'','',1758568667035);
INSERT INTO SearchLog VALUES(10,'digi',0,'','',1758568809332);
INSERT INTO SearchLog VALUES(11,'вшп',0,'','',1758568913576);
INSERT INTO SearchLog VALUES(12,'вшпш',0,'','',1758568913576);
INSERT INTO SearchLog VALUES(13,'digi',0,'','',1758568922389);
INSERT INTO SearchLog VALUES(14,'digi',0,'','',1758568928160);
INSERT INTO SearchLog VALUES(15,'app',0,'','',1758568933118);
INSERT INTO SearchLog VALUES(16,'dig',0,'','',1758570202877);
DELETE FROM sqlite_sequence;
INSERT INTO sqlite_sequence VALUES('Service',220);
INSERT INTO sqlite_sequence VALUES('MenuTile',2);
INSERT INTO sqlite_sequence VALUES('WhyArticle',2);
INSERT INTO sqlite_sequence VALUES('PriceRow',470);
INSERT INTO sqlite_sequence VALUES('Tier',1387);
INSERT INTO sqlite_sequence VALUES('SearchLog',16);
CREATE UNIQUE INDEX "Service_slug_key" ON "Service"("slug");
CREATE UNIQUE INDEX "Account_provider_providerAccountId_key" ON "Account"("provider", "providerAccountId");
CREATE UNIQUE INDEX "Session_sessionToken_key" ON "Session"("sessionToken");
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");
CREATE UNIQUE INDEX "VerificationToken_token_key" ON "VerificationToken"("token");
CREATE UNIQUE INDEX "VerificationToken_identifier_token_key" ON "VerificationToken"("identifier", "token");
CREATE UNIQUE INDEX "Order_orderNumber_key" ON "Order"("orderNumber");
CREATE UNIQUE INDEX "Invoice_invoiceNumber_key" ON "Invoice"("invoiceNumber");
CREATE UNIQUE INDEX "Settings_key_key" ON "Settings"("key");
CREATE INDEX "SearchLog_query_idx" ON "SearchLog"("query");
CREATE INDEX "SearchLog_timestamp_idx" ON "SearchLog"("timestamp");
COMMIT;
