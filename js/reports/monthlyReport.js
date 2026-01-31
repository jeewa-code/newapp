
(function () {
    "use strict";

    function el(tag, attrs = {}, children = []) {
        const e = document.createElement(tag);
        for (const k in attrs) {
            if (k === "html") e.innerHTML = attrs[k];
            else if (k === "text") e.textContent = attrs[k];
            else e.setAttribute(k, attrs[k]);
        }
        children.forEach(c => e.appendChild(c));
        return e;
    }

    const std = (id, text) => ({ id, text });
    const group = (id, text, children) => ({ id, text, children });

    const reportData = [
        {
            sectionId: "A",
            title: "Housing & Sanitation | නිවාස සහ සනීපාරක්ෂාව | வீட்டுவசதி மற்றும் சுகாதாரம்",
            tables: [
                {
                    type: "tree",
                    items: [
                        std("1", "Number of houses in sanitation register<br>සනීපාරක්ෂක ලේඛනයේ නිවාස ගණන | சுகாதார பதிவேட்டில் உள்ள வீடுகளின் எண்ணிக்கை"),
                        std("2", "Number of houses using sanitary waste disposal methods<br>සනීපාරක්ෂක අපද්‍රව්‍ය බැහැර කිරීමේ ක්‍රම භාවිතා කරන නිවාස ගණන | சுகாதார கழிவுகளை அகற்றும் முறைகளைப் பயன்படுத்தும் வீடுகளின் எண்ணிக்கை"),
                        group("3", "Number of houses without sanitary latrines<br>සනීපාරක්ෂක වැසිකිළි රහිත නිවාස ගණන | மலசலகூடங்கள் இல்லாத வீடுகளின் எண்ணிக்கை", [
                            std("1", "Number without latrines at all<br>වැසිකිළි නොමැති නිවාස ගණන | மலசலகூடங்கள் இல்லாத வீடுகளின் எண்ணிக்கை"),
                            std("2", "Number with insanitary latrines<br>සනීපාරක්ෂක නොවක වැසිකිළි සහිත නිවාස ගණන | சுகாதாரமற்ற மலசலகூடங்களை கொண்ட வீடுகளின் எண்ணிக்கை")
                        ]),
                        group("4", "Number of houses with sanitary latrines<br>සනීපාරක්ෂක වැසිකිළි සහිත නිවාස ගණන | சுகாதாரமான மலசலகூடங்கள் இல்லாத வீடுகளின் எண்ணிக்கை", [
                            std("1", "Water seal type<br>ජල මුද්‍රාව සහිත | நீர்த்தடை வகை"),
                            std("2", "Other type<br>වෙනත් වර්ග | ஏனைய வகைகள்")
                        ]),
                        group("5", "Latrines constructed during the month<br>මෙම මාසය තුළ ඉදිකරන ලද වැසිකිළි ගණන | இந்த மாதத்தில் கட்டப்பட்ட மலசலகூடங்களின் எண்ணிக்கை", [
                            std("1", "Water seal type<br>ජල මුද්‍රාව සහිත | நீர்த்தடை வகை"),
                            std("2", "Other type<br>වෙනත් වර්ග | ஏனைய வகைகள்")
                        ]),
                        group("6", "Building applications<br>ගොඩනැගිලි ඉදිකිරීම සඳහා අයදුම්පත් | கட்டிட நிர்மாணத்திற்கான விண்ணப்பங்கள்", [
                            std("1", "Number of new applications received<br>ලැබූ නව අයදුම්පත් ගණන | பெறப்பட்ட புதிய விண்ணப்பங்களின் எண்ணிக்கை"),
                            group("2", "Number inspected<br>පරීක්ෂා කරන ලද ඉඩම් ගණන | பரிசோதனை செய்யப்பட்ட வளாகங்களின் எண்ணிக்கை", [
                                std("a", "first<br>පළමු පරීක්ෂාව | முதல் பரிசோதனை"),
                                std("b", "subsequent<br>පසුව කරන ලද පරීක්ෂා | தொடர் பரிசோதனை")
                            ]),
                            std("3", "Number of unauthorized constructions reported to local authority<br>වාර්තා කරන ලද අනවසර ඉදිකිරීම් ගණන | உள்ளூராட்சி மன்றத்திற்கு அறிவிக்கப்பட்ட அங்கீகரிக்கப்படாத நிர்மாணங்களின் எண்ணிக்கை"),
                            std("4", "Number of prosecutions by PHI<br>මහජන සෞඛ්‍ය පරීක්ෂක විසින් සිදුකළ නඩු පැවරීම් ගණන | பொது சுகாதார பரிசோதகர் தாக்கல் செய்த வழக்குகளின் எண்ணிக்கை"),
                            std("5", "Number of certificates of conformity recommended<br>ගොඩනැගිලි ඉදිකිරීම සඳහා නිර්දේශිත අනුකූලතා සහතික ගණන | கட்டிட நிர்மாணத்திற்கான பரிந்துரைக்கப்பட்ட இணக்க சான்றிதழ்களின் எண்ணிக்கை")
                        ])
                    ]
                }
            ]
        },
        {
            sectionId: "B",
            title: "Water Supply | ජල සම්පාදනය | நீர் வழங்கல்",
            tables: [
                {
                    type: "tree",
                    items: [
                        group("1", "Number of houses obtaining water according to source<br>ජලය ලබා ගන්නා නිවාස ගණන - විවිධ ජල ප්‍රභවයන්ට අනුව | நீர் பெறும் வீடுகளின் எண்ணிக்கை, நீர் மூலங்களுக்கு ஏற்ப", [
                            group("1", "Pipe borne<br>ජල නල හරහා | குழாய்கள் மூலம்", [
                                std("a", "NWSDB (National water supply and drainage board)<br>ජල නල හරහා | தேசிய நீர்வழங்கள் வடிகாலமைப்பு சபை"),
                                std("b", "CWS(community water schemes)<br>ප්‍රජා ජල යෝජනා ක්‍රම | சமூக நீர் வழங்கல் திட்டங்கள்")
                            ]),
                            std("2", "Protected well<br>ආරක්ෂිත ළිං ගණන | பாதுகாப்பான கிணறுகளின் எண்ணிக்கை"),
                            std("3", "Unprotected well<br>අනාරක්ෂිත ළිං ගණන | பாதுகாப்பற்ற கிணறுகளின் எண்ணிக்கை"),
                            std("4", "Deep tube well/ tube well<br>ගැඹුරු නල ළිං / නල ළිං ගණන | ஆழமான குழாய் கிணறுகள் / குழாய் கிணறுகளின் எண்ணிக்கை"),
                            std("5", "RO plants (reverse osmosis plants)<br>ප්‍රති ආශ්‍රැත පිරිපහදු පද්ධති | எதிர்மறை சவ்வுடுபரவல் திட்டங்கள்"),
                            std("6", "Other and more than one source<br>වෙනත් | ஏனையவை")
                        ]),
                        group("2", "Inspection of public water scheme<br>පොදු ජල යෝජනා ක්‍රම පරීක්ෂාව | பொது நீர் திட்டங்களை பரிசோதனை செய்தல்", [
                            std("1", "Number of public water schemes inspected<br>පරීක්ෂා කරන ලද පොදු ජල යෝජනා ක්‍රම ගණන | சோதனை செய்யப்பட்ட பொது நீர் திட்டங்களின் எண்ணிக்கை"),
                            std("2", "Found defective<br>දෝෂ සහිත පොදු ජල යෝජනා ක්‍රම ගණන | குறைபாடுள்ள பொது நீர் திட்டங்களின் எண்ணிக்கை"),
                            std("3", "Number of action taken<br>ගෙන ඇති ක්‍රියාමාර්ග ගණන | எடுக்கப்பட்ட நடவடிக்கைகளின் எண்ணிக்கை")
                        ]),
                        group("3", "Number of public water supplies sampled<br>සාම්පල පරීක්ෂා කරන ලද පොදු ජල සැපයුම් ගණන | எடுக்கப்பட்ட மாதிரி பொது நீர் விநியோகங்களின் எண்ணிக்கை", [
                            group("1", "Bacteriological<br>බැක්ටීරියා පරීක්ෂාව | நுண்ணுயிரியல்", [
                                std("a", "Number of bacteriological water samples taken<br>බැක්ටීරියා පරීක්ෂාව සඳහා ලබාගත් ජල සාම්පල ගණන | பாக்டீரியா சோதனைக்காக எடுக்கப்பட்ட நீர் மாதிரிகளின் எண்ணிக்கை"),
                                std("b", "Number of bacteriological samples satisfactory<br>සතුටුදායක මට්ටමේ පවතින බැක්ටීරියා ජල සාම්පල ගණන | திருப்திகரமான பாக்டீரியா நீர் மாதிரிகளின் எண்ணிக்கை")
                            ]),
                            group("2", "Chemical<br>රසායනික පරීක්ෂාව | இரசாயன", [
                                std("a", "Number of chemical water samples taken<br>රසායනික පරීක්ෂාව සඳහා ලබාගත් ජල සාම්පල ගණන | எடுக்கப்பட்ட இரசாயன நீர் மாதிரிகளின் எண்ணிக்கை"),
                                std("b", "Number of chemical water samples satisfactory<br>සතුටුදායක මට්ටමේ පවතින රසායනික ජල සාම්පල ගණන | திருப்திகரமான உள்ள இரசாயன நீர் மாதிரிகளின் எண்ணிக்கை")
                            ])
                        ]),
                        group("4", "Number of private water sources sampled<br>සාම්පල පරීක්ෂා කරන ලද පෞද්ගලික ජල ප්‍රභව ගණන | மாதிரி எடுக்கப்பட்ட தனியார் நீர் மூலங்களின் எண்ணிக்கை", [
                            group("1", "Bacteriological<br>බැක්ටීරියා පරීක්ෂාව | நுண்ணுயிரியல்", [
                                std("a", "Number of bacteriological water samples taken<br>බැක්ටීරියා පරීක්ෂාව සඳහා ලබාගත් ජල සාම්පල ගණන | எடுக்கப்பட்ட பாக்டீரியாவியல் நீர் மாதிரிகளின் எண்ணிக்கை"),
                                std("b", "Number of bacteriological samples satisfactory<br>සතුටුදායක මට්ටමේ පවතින් බැක්ටීරියා ජල සාම්පල ගණන | திருப்திகரமான பாக்டீரியா நீர் மாதிரிகளின் எண்ணிக்கை")
                            ]),
                            group("2", "Chemical<br>රසායනික", [
                                std("a", "Number of chemical water samples taken<br>රසායනික පරීක්ෂාව සඳහා ලබාගත් ජල සාම්පල ගණන | எடுக்கப்பட்ட இரசாயன நீர் மாதிரிகளின் எண்ணிக்கை"),
                                std("b", "Number of chemical water samples satisfactory<br>සතුටුදායක මට්ටමේ පවතින රසායනික ජල සාම්පල ගණන | இரசாயன நீர் மாதிரிகளின் எண்ணிக்கை திருப்திகரமாக உள்ளது")
                            ])
                        ]),
                        std("5", "Number of wells chlorinated<br>ක්ලෝරීන්කෘත ළිං ගණන | குளோரின் இடப்பட்ட கிணறுகளின் எண்ணிக்கை"),
                        group("6", "Schemes chlorinated<br>ක්ලෝරීන්කෘත ජල යෝජනා ක්‍රම | குளோரின் இடப்பட்ட நீர் திட்டங்கள்", [
                            std("1", "Number of schemes chlorinated<br>ක්ලෝරීන්කෘත ජල යෝජනා ක්‍රම ගණන | குளோரினேற்றப்பட்ட நீர் திட்டங்களின் எண்ணிக்கை"),
                            std("2", "Number of samples taken<br> ලබාගත් සාම්පල ගණන | எடுக்கப்பட்ட மாதிரிகளின் எண்ணிக்கை")
                        ])
                    ]
                }
            ]
        },
        {
            sectionId: "C",
            title: "Food Safety & Hygiene | ආහාර සුරක්ෂිතතාව සහ සනීපාරක්ෂාව | உணவு பாதுகாப்பு மற்றும் சுகாதாரம்",
            tables: [
                {
                    type: "grid",
                    title: "1. Registration of food handling establishments Food (Registration of premises) Regulation 2019<br>ආහාර පරිහරණ ආයතන ලියාපදිංචි කිරීම - ආහාර (බලපත්‍ර) රෙගුලාසි 2019 | உணவு கையாளும் நிறுவனங்களை பதிவு செய்தல் - உணவு (வளாகப் பதிவு) ஒழுங்குமுறை 2019",
                    headers: [
                        { text: "No", width: "30px" },
                        { text: "Description" },
                        { text: "1(a) Total number of Food Establishments in the Area<br>පොදු සෞඛ්‍ය පරීක්ෂක ප්‍රදේශය තුළ ඇති මුළු ආහාර ආයතන ගණන | பகுதியில் உள்ள மொத்த உணவு நிறுவனங்களின் எண்ணிக்கை", width: "250px" },
                        { text: "1(b) Registered under the Food Regulation<br>ලියාපදිංචි කරන ලද ආයතන<br>பதிவு செய்யப்பட்டவை", width: "250px" }
                    ],
                    rows: [
                        { id: "1", text: "Hotels & Resorts<br>හෝටල් සහ නිවාඩු නිකේතන | ஹோட்டல் & ரிசார்ட்ஸ்" },
                        { id: "2", text: "Catering Establishments<br>සැපයුම් සේවා | உணவு விடுதிகள்" },
                        { id: "3", text: "Restaurants or Eating Houses<br>ආපනශාලා | உணவகங்கள்" },
                        { id: "4", text: "Ice-cream, Confectionery, Yoghurt, Curd, Desserts Manufacturing Cottage Industry<br>අයිස්ක්‍රීම්, රසකැවිලි, යෝගට්, මීකිරි, අතුරුපස | ஐஸ்கிரீம், மிட்டாய், தயிர், இனிப்பு வகைகள்" },
                        { id: "5", text: "Tea, Coffee, Beverages, Ready to Serve Drinks, Ice-cream boutique<br>තේ, කෝපි, බීම | தேநீர், காபி, பானங்கள்" },
                        { id: "6", text: "Bakeries<br>බේකරි | பேக்கரிகள்" },
                        { id: "7", text: "Canteens<br>කැන්ටිම් | சிற்றுண்டிச்சாலை" },
                        { id: "8", text: "Supermarkets Serving Ready to Eat or Prepared Food<br>සුපිරි වෙළඳසැල් | பல்பொருள் அங்காடிகள்" },
                        { id: "9", text: "Food Stores<br>ආහාර ගබඩා | உணவு களஞ்சியங்கள்" },
                        { id: "10", text: "Ice manufacturing premises<br>අයිස් නිෂ්පාදන ආයතන | பனிக்கட்டி உற்பத்தி நிலையங்கள்" }
                    ]
                },
                {
                    type: "grid",
                    title: "1(b) Registration of food handling establishments (H 800 revised)<br>ආහාර පරිහරණ ආයතන ලියාපදිංචි කිරීම (H 800 සංශෝධිත) | உணவு கையாளும் நிறுவனங்களின் பதிவு (H 800 திருத்தப்பட்டது)",
                    headers: [
                        { text: "No", width: "30px" },
                        { text: "Description" },
                        { text: "Grade A<br>(Good)<br>A ශ්‍රේණිය (යහපත්)<br>தரம் A<br>(நல்லது)", width: "100px" },
                        { text: "Grade B<br>(Satisfactory)<br>B ශ්‍රේණිය (සතුටුදායක)<br>தரம் B<br>(திருப்திகரமான)", width: "100px" },
                        { text: "Grade C<br>(Unsatisfactory)<br>C ශ්‍රේණිය<br>(අසතුටුදායක)<br>தரம் C (திருப்தியற்றது)", width: "100px" },
                        { text: "Grade D<br>(Very Unsatisfactory)<br>D ශ්‍රේණිය(ඉතා අසතුටුදායක)<br>தரம் D(மிகவும் திருப்தியற்றது)", width: "100px" } // No change needed here
                    ],
                    rows: [
                        { id: "1", text: "Food factory<br>ආහාර කර්මාන්තශාලා | உணவு தொழிற்சாலை" },
                        { id: "2", text: "Catering Establishment<br>සැපයුම් සේවා | உணவு விடுதிகள்" },
                        { id: "3", text: "Hotel<br>හෝටල් | ஹோட்டல்" },
                        { id: "4", text: "Restaurant<br>ආපනශාලා | உணவகம்" },
                        { id: "5", text: "Canteen<br>කැන්ටිම් | சிற்றுண்டிச்சாலை" },
                        { id: "6", text: "Bakery<br>බේකරි | பேக்கரி" },
                        { id: "7", text: "Tea, Coffee, Beverages or Ice cream boutique<br>තේ, කෝපි, බීම | தேநீர், காபி, பானங்கள்" },
                        { id: "8", text: "Grocery<br>සිල්ලර බඩු සාප්පු | மளிகை கடை" },
                        { id: "9", text: "Supermarket<br>සුපිරි වෙළඳසැල් | பல்பொருள் அங்காடி" },
                        { id: "10", text: "Food store<br>ආහාර ගබඩා | உணவு களஞ்சியம்" },
                        { id: "11", text: "Others<br>වෙනත් | மற்றவை" }
                    ]
                },
                {
                    type: "grid",
                    title: "2. Inspection of food handling establishment<br>ආහාර පරිහරණය කිරීමේ ආයතන පරීක්ෂා කිරීම | பரிசோதனை செய்யப்பட்ட உணவு கையாளும் நிலையங்கள்",
                    headers: [{ text: "No", width: "30px" }, { text: "Description" }, { text: "Count / Amount<br>ගණන / ප්‍රමාණය | அளவு", width: "120px" }],
                    rows: [
                        { id: "1", text: "Total number of inspections<br>මුළු පරීක්ෂා කිරීම් ගණන | பரிசோதனை செய்யப்பட்ட உணவு கையாளும் நிலையங்களின் எண்ணிக்கை" },
                        { id: "2", text: "Number served notice<br>නිකුත් කල නිවේදන ගණන | முறைப்படி அறிவுறுத்தல் வழங்கப்பட்டவற்றின் எண்ணிக்கை" },
                        { id: "3", text: "Number prosecuted<br>ගොනු කර ඇති නඩු ගණන | தாக்கல் செய்யப்பட்ட வழக்குகளின் எண்ணிக்கை" },
                        { id: "4", text: "Number convicted<br>වරදකරුවන් වූ ආයතන ගණන | குற்றம் நிரூபிக்கப்பட்டவற்றின் எண்ணிக்கை" },
                        { id: "5", text: "Number of cases pending<br>විභාග වෙමින් පවතින නඩු ගණන | நிலுவையில் உள்ள வழக்குகளின் எண்ணிக்கை" },
                        { id: "6", text: "Fined (Rs)<br>දඩ මුදල (රුපියල්) | அபராத தொகை ரூபா" }
                    ]
                },
                {
                    type: "grid",
                    title: "3. Food sampling - Formal samples<br>ආහාර සාම්පල කිරීම - විධිමත් සාම්පල | உணவு மாதிரி - முறையான மாதிரிகள்",
                    headers: [
                        { text: "No", width: "30px" },
                        { text: "Description" },
                        { text: "(a) Chemical<br>රසායනික<br>இரசாயன", width: "100px" },
                        { text: "(b) Microbio.<br>ක්ෂුද්‍ර ජීවී<br>நுண்ணுயிரியல்", width: "100px" }
                    ],
                    rows: [
                        { id: "1", text: "Total number of formal samples taken<br>ලබාගත් විධිමත් සාම්පල ගණන | முறையான மாதிரிகளின் மொத்த எண்ணிக்கை" },
                        { id: "2", text: "Number of reports received<br>ලැබී ඇති වාර්තා ගණන | அறிக்கைகளின் எண்ணிக்கை" },
                        { id: "3", text: "Number found unsatisfactory<br>අසතුටුදායක සාම්පල ගණන | திருப்தியற்ற மாதிரிகளின் எண்ணிக்கை" },
                        { id: "4", text: "Number prosecuted<br>ගොනු කර ඇති නඩු ගණන | தாக்கல் செய்யப்பட்ட வழக்குகளின் எண்ணிக்கை" },
                        { id: "5", text: "Number convicted<br>වරදකරුවන් වූ ගණන | குற்றம் நிரூபிக்கப்பட்டவற்றின் எண்ணிக்கை" },
                        { id: "6", text: "Fined Rs.<br>දඩ මුදල (රුපියල්) | அபராத தொகை ரூபா" },
                        { id: "7", text: "Number of reports pending<br>ලැබීමට නියමිත වාර්තා ගණන | நிலுவையில் உள்ள அறிக்கைகளின் எண்ணிக்கை" },
                        { id: "8", text: "Number of cases pending<br>විභාග වෙමින් පවතින නඩු ගණන | நிலுவையில் உள்ள வழக்குகளின் எண்ணிக்கை" }
                    ]
                },
                {
                    type: "grid",
                    // title: "Regulations Implementation", // Already in table rows
                    headers: [
                        { text: "No", width: "30px" }, { text: "Regulation" }, { text: "1 samples<br>සාම්පල", width: "60px" }, { text: "2 bact<br>බැක්ටීරියා", width: "60px" },
                        { text: "3 unsat<br>අසතුටුදායක", width: "60px" }, { text: "4 pros<br>නඩු", width: "60px" }, { text: "5 conv<br>වරද", width: "60px" }, { text: "6 fined<br>දඩ", width: "60px" },
                        { text: "7 pen<br>වාර්තා", width: "60px" }, { text: "8 case<br>නඩු", width: "60px" }
                    ],
                    rows: [
                        { id: "9", text: "Iodine regulation<br>අයඩින් නියාමය" },
                        { id: "10", text: "Bottle water<br>බෝතල් කළ ජලය" },
                        { id: "11", text: "Labeling & Advertising<br>ලේබල් කිරීම සහ ප්‍රචාරණය" },
                        { id: "12", text: "Food colouring<br>ආහාර වර්ණක" },
                        { id: "13", text: "Sweetners<br>ආහාර රසකාරක" },
                        { id: "14", text: "Preservatives<br>ආහාර කල් තබා ගන්නා ද්‍රව්‍ය" },
                        { id: "15", text: "Food Standards (1989)<br>ආහාර ප්‍රමිති (1989)" },
                        { id: "16", text: "Milk reg.1989<br>කිරි සම්බන්ධ රෙගුලාසි 1989" },
                        { id: "17", text: "Anti oxidants<br>ප්‍රතිඔක්සිකාරක" },
                        { id: "18", text: "Food packages<br>ආහාර ඇසුරුම්" },
                        { id: "19", text: "Vinegar<br>විනාකිරි" },
                        { id: "20", text: "Food hygiene<br>ආහාර සනීපාරක්ෂාව" },
                        { id: "21", text: "Food Act<br>ආහාර පනත | உணவு சட்டம்" },
                        { id: "22", text: "Other regulation<br>වෙනත් රෙගුලාසි | பிற விதிமுறைகள்" }
                    ]
                },
                {
                    type: "grid",
                    title: "23. Reports Delayed",
                    headers: [
                        { text: "No", width: "30px" },
                        { text: "Description" },
                        { text: "Reports Received<br>ලැබුණු මුළු වාර්තා ගණන | மொத்த அறிக்கைகள்", width: "120px" },
                        { text: "Unsatisfactory<br>අසතුටුදායක සාම්පල | திருப்தியற்ற மாதிரிகள்", width: "120px" }
                    ],
                    rows: [
                        { id: "23", text: "Reports received delayed (After 3 months)<br>ප්‍රමාද වී ලැබුණු මුළු වාර්තා (මාස 3 පසුව) | தாமதமாக பெறப்பட்ட அறிக்கைகள்" }
                    ]
                },
                {
                    type: "grid",
                    title: "4. Informal samples<br>අවිධිමත් සාම්පල | முறைசாரா மாதிரிகள்",
                    headers: [{ text: "No", width: "30px" }, { text: "Description" }, { text: "Count", width: "120px" }],
                    rows: [
                        { id: "1", text: "Total number of informal samples taken<br>ලබාගත් මුළු අවිධිමත් සාම්පල ගණන | பெறப்பட்ட முறைசாரா மாதிரிகளின் எண்ணிக்கை" },
                        { id: "2", text: "Number satisfactory<br>සතුටුදායක සාම්පල ගණන | திருப்திகரமான மாதிரிகளின் எண்ணிக்கை" },
                        { id: "3", text: "Number of iodised salt samples taken<br>ලබාගත් අයඩින් ලුණු සාම්පල ගණන | எடுக்கப்பட்ட அயடின் உப்பு மாதிரிகளின் எண்ணிக்கை" },
                        { id: "4", text: "Number found unsatisfactory<br>අසතුටුදායක සාම්පල ගණන | திருப்தியற்ற மாதிரிகளின் எண்ணிக்கை" }
                    ]
                },
                {
                    type: "grid",
                    title: "5. Food seizures<br>ආහාර අත්අඩංගුවට ගැනීම් | உணவு கைப்பற்றல்",
                    headers: [{ text: "No", width: "30px" }, { text: "Description" }, { text: "Count", width: "120px" }],
                    rows: [
                        { id: "1", text: "Number of food raids conducted<br>සිදුකළ ආහාර වැටලීම් ගණන | நடத்தப்பட்ட உணவு சோதனைகளின் எண்ணிக்கை" },
                        { id: "2", text: "Number of establishments where food seized<br>අත්අඩංගුවට ගත් ආහාර අයිති ආයතන ගණන | நிறுவனம் உணவு கைப்பற்றப்பட்ட எண்ணிக்கை" },
                        { id: "3", text: "Number of food items seized<br>අත්අඩංගුවට ගත් ආහාර ද්‍රව්‍ය ගණන | கைப்பற்றப்பட்ட உணவு பொருட்கள் எண்ணிக்கை" },
                        { id: "4", text: "Number of items destroyed<br>විනාශ කළ ආහාර ද්‍රව්‍ය ගණන | அழிக்கப்பட்ட உணவுப் பொருட்கள் எண்ணிக்கை" },
                        { id: "5", text: "Number of items prosecuted<br>නඩු පවරා ඇති ආහාර ද්‍රව්‍ය ගණන | வழக்குத் தொடரப்பட்ட உணவுப் பொருட்கள் எண்ணிக்கை" },
                        { id: "6", text: "Fined Rs.<br>දඩ මුදල (රුපියල්) | அபராத தொகை ரூபா" },
                        { id: "7", text: "Number of complaints received<br>ලැබුණු පැමිණිලි ගණන | பெறப்பட்ட முறைப்பாடுகளின் எண்ணிக்கை" },
                        { id: "8", text: "Number investigated, actions taken and reported<br>විමර්ශනය සිදුකළ, ක්‍රියාමාර්ග ගත් හා වාර්තා කරන ලද | விசாரணை செய்யப்பட்டு நடவடிக்கை எடுக்கப்பட்ட எண்ணிக்கை" },
                        { id: "9", text: "Number of complaint confirmed<br>තහවුරු කර ඇති පැමිණිලි ගණන | உறுதிப்படுத்தப்பட்ட முறைப்பாடுகளின் எண்ணிக்கை" },
                        { id: "10", text: "Number prosecuted<br>ගොනු කර ඇති නඩු ගණන | தாக்கல் செய்யப்பட்ட வழக்குகளின் எண்ணிக்கை" },
                        { id: "11", text: "Fined Rs.<br>දඩ මුදල (රුපියල්) | அபராத தொகை ரூபா" }
                    ]
                },
                {
                    type: "grid",
                    title: "6. Food poisoning<br>ආහාර විෂවීම් | உணவு விஷமாதல்",
                    headers: [{ text: "No", width: "30px" }, { text: "Description" }, { text: "Count", width: "120px" }],
                    rows: [
                        { id: "1", text: "Number of food poisoning incident reported<br>වාර්තා වූ ආහාර විෂවීම් සිද්ධි ගණන | அறிவிக்கப்பட்ட உணவு விஷமாதல் சம்பவங்கள்" },
                        { id: "2", text: "Number of persons affected<br>ආහාර විෂවීම් වලට ලක්වූ පුද්ගලයින් ගණන | பாதிக்கப்பட்ட நபர்களின் எண்ணிக்கை" },
                        { id: "4", text: "Number investigated<br>සිදුකළ විමර්ශන ගණන | விசாரிக்கப்பட்ட சம்பவங்களின் எண்ணிக்கை" },
                        { id: "5", text: "Number of actions taken<br>ගෙන ඇති ක්‍රියාමාර්ග ගණන | எடுக்கப்பட்ட நடவடிக்கைகளின் எண்ணிக்கை" }
                    ]
                },
                {
                    type: "grid",
                    title: "7. Fairs<br>පොළවල් | சந்தைகள்",
                    headers: [{ text: "No", width: "30px" }, { text: "Description" }, { text: "Count", width: "120px" }],
                    rows: [
                        { id: "1", text: "Number of functioning fairs<br>ක්‍රියාත්මක වන පොළවල් ගණන | நடைமுறையில் உள்ள சந்தைகளின் எண்ணிக்கை" },
                        { id: "2", text: "Number of inspection done<br>සිදුකරන ලද පරීක්ෂා ගණන | பரிசோதனை செய்யப்பட்டவற்றின் எண்ணிக்கை" },
                        { id: "3", text: "Number of items seized<br>භාණ්ඩ අත්අඩංගුවට ගැනීම් ගණන | கைப்பற்றப்பட்ட பொருட்களின் எண்ணிக்கை" }
                    ]
                },
                {
                    type: "grid",
                    title: "8. Medical inspection of food handlers<br>ආහාර පරිහරණය කරන්නන්ගේ වෛද්‍ය පරීක්ෂාව | உணவு கையாளுபவர்களின் மருத்துவ பரிசோதனை",
                    headers: [{ text: "No", width: "30px" }, { text: "Description" }, { text: "Count", width: "120px" }],
                    rows: [
                        { id: "1", text: "Number of food handlers medically inspected<br>වෛද්‍ය පරීක්ෂාවට ලක් කළ ආහාර පරිහරණය කරන්නන් ගණන | மருத்துவ பரிசோதனைக்குட்படுத்தப்பட்ட உணவு கையாளுபவர்களின் எண்ணிக்கை" },
                        { id: "2", text: "Number of health certificates issued<br>නිකුත් කළ සෞඛ්‍ය සහතික ගණන | ஆரோக்கியமானவர்கள் என உறுதிப்படுத்தப்பட்ட உணவு கையாளுபவர்களின் எண்ணிக்கை" }
                    ]
                },
                {
                    type: "grid",
                    title: "9. Animals passed for slaughter<br>ඝාතනය සඳහා සතුන් අනුමත කිරීම | அறுவைக்கு விலங்குகளை அனுமதித்தல்",
                    headers: [{ text: "No", width: "30px" }, { text: "Description" }, { text: "Count", width: "120px" }],
                    rows: [
                        { id: "1", text: "Number of animals passed for slaughter<br>ඝාතනය සඳහා අනුමත කළ සතුන් ගණන | அறுவைக்காக அனுமதிக்கப்பட்ட விலங்குகளின் எண்ணிக்கை" },
                        { id: "2", text: "Number of animals rejected<br>ඝාතනය සඳහා ප්‍රතික්ෂේප වූ සතුන් ගණන | அனுமதி மறுக்கப்பட்ட விலங்குகளின் எண்ணிக்கை" }
                    ]
                },
                {
                    type: "grid",
                    title: "10. Health Education on food hygiene<br>ආහාර සනීපාරක්ෂාව පිළිබඳ සෞඛ්‍ය අධ්‍යාපනය | உணவு சுகாதாரம் குறித்த சுகாதார கல்வி",
                    headers: [
                        { text: "No", width: "30px" },
                        { text: "Description" },
                        { text: "(a) Total<br>මුළු<br>மொத்தம்", width: "80px" },
                        { text: "(b) Planned<br>සැලසුම්<br>திட்டமிடப்பட்டது", width: "80px" },
                        { text: "(c) Conducted<br>පැවැත්වූ<br>நடத்தப்பட்டது", width: "80px" },
                        { text: "Participants<br>සහභාගීත්වය<br>பங்கேற்பாளர்கள்", width: "80px" }
                    ],
                    rows: [
                        { id: "1", text: "Traders/Vendors<br>වෙළඳුන් / විකුණුම්කරුවන් | வர்த்தகர்கள் / விற்பனையாளர்கள்" },
                        { id: "2", text: "Food Handlers<br>ආහාර පරිහරණය කරන්නන් | உணவு கையாளுபவர்கள்" },
                        { id: "3", text: "Community<br>ප්‍රජාව | சமூகம்" },
                        { id: "4", text: "Schools<br>පාසල් | பாடசாலை" },
                        { id: "5", text: "Local Authority/Offices<br>පළාත් පාලන ආයතන / කාර්යාල | உள்ளூர் அதிகாரசபை / அலுவலகங்கள்" },
                        { id: "6", text: "Other institutions<br>වෙනත් ආයතන | பிற நிறுவனங்கள்" },
                        { id: "7", text: "Consumer associations<br>පාරිභෝගික සංගම් | நுகர்வோர் சங்கங்கள்" }
                    ]
                },
                {
                    type: "grid",
                    title: "11. Other awareness sessions conducted<br>වෙනත් දැනුවත් කිරීමේ වැඩසටහන් ගණන | நடத்தப்பட்ட பிற விழிப்புணர்வு அமர்வுகள்",
                    headers: [{ text: "No", width: "30px" }, { text: "Description" }, { text: "Count", width: "120px" }],
                    rows: [
                        { id: "1", text: "Food safety week<br>ආහාර සුරක්ෂිතතා සතිය | உணவு பாதுகாப்பு வாரம்" },
                        { id: "2", text: "Food safety day<br>ආහාර සුරක්ෂිතතා දිනය | உணவு பாதுகாப்பு தினம்" },
                        { id: "3", text: "Festival<br>උත්සව අවස්ථා | திருவிழா சந்தர்ப்பங்கள்" }
                    ]
                }
            ]
        },
        {
            sectionId: "II",
            title: "Area Specific (Estates / Trades) | ප්‍රදේශයට විශේෂිත (වතු / වෙළඳ) | பகுதி குறிப்பானது (தோட்டங்கள் / வர்த்தகம்)",
            tables: [
                {
                    type: "grid",
                    title: "2. Estates in the area<br>ප්‍රදේශයේ වතු | அப்பகுதியில் உள்ள தோட்டங்கள்",
                    headers: [{ text: "No", width: "30px" }, { text: "Description" }, { text: "Count", width: "120px" }],
                    rows: [
                        { id: "1", text: "Number of estates<br>වතු ගණන | தோட்டங்களின் எண்ணிக்கை" },
                        { id: "2", text: "Number of divisions<br>කොට්ඨාශ ගණන | பிரிவுகளின் எண்ணிக்கை" },
                        { id: "3", text: "Number of visits for sanitation activities<br>සනීපාරක්ෂක කටයුතු වෙනුවෙන් සිදුකළ සංචාර ගණන | துப்புரவு நடவடிக்கைகளுக்கான வருகைகளின் எண்ணிக்கை" },
                        { id: "4", text: "Number of educational programmes carried out<br> අධ්‍යාපනික වැඩසටහන් ගණන | கல்விசார் நிகழ்ச்சிகளின் எண்ணிக்கை" },
                        { id: "5", text: "Number of service programmes carried out<br>සේවා වැඩසටහන් ගණන | மேற்கொள்ளப்பட்ட சேவை நிகழ்ச்சிகளின் எண்ணிக்கை" }
                    ]
                },
                {
                    type: "grid",
                    title: "3. Trades & industries license / registration<br>වෙළඳ හා කර්මාන්ත බලපත්‍ර / ලියාපදිංචි කිරීම් | வர்த்தக மற்றும் தொழில்கள் உரிமம் / பதிவு",
                    headers: [{ text: "No", width: "30px" }, { text: "Description" }, { text: "Count", width: "120px" }],
                    rows: [
                        { id: "1", text: "Trade licensing applications received<br>වෙළඳ බලපත්‍ර ලබාගැනීම සඳහා ලැබී ඇති අයදුම්පත් ගණන | பெறப்பட்ட வர்த்தக உரிம விண்ணப்பங்களின் எண்ணிக்கை" },
                        { id: "2", text: "Trade licensing inspected<br>වෙළඳ බලපත්‍ර පරීක්ෂා කිරීම් ගණන | வர்த்தக உரிம ஆய்வுகளின் எண்ணிக்கை" },
                        { id: "3", text: "Trade licensing recommended<br>නිර්දේශිත වෙළඳ බලපත්‍ර ගණන | பரிந்துரைக்கப்பட்ட வர்த்தக உரிமம்" },
                        { id: "4", text: "Trade licensing rejected<br>ප්‍රතික්ෂේපිත වෙළඳ බලපත්‍ර ගණන | நிராகரிக்கப்பட்ட வர்த்தக உரிமங்களின் எண்ணிக்கை" },
                        { id: "5", text: "EPL licensing (B & C) applications received<br>පරිසර ආරක්ෂණ බලපත්‍ර (B සහ C කොටස) ලබාගැනීම සඳහා ලැබී ඇති අයදුම්පත් ගණන | சுற்றுச்சூழல் பாதுகாப்பு உரிமத்திற்கான விண்ணப்பங்களின் எண்ணிக்கை" },
                        { id: "6", text: "EPL licensing inspected<br>පරිසර ආරක්ෂණ බලපත්‍ර පරීක්ෂා කිරීම් ගණන | சுற்றுச்சூழல் பாதுகாப்பு உரிம ஆய்வுகளின் எண்ணிக்கை" },
                        { id: "7", text: "EPL licensing recommended<br>නිර්දේශිත පරිසර ආරක්ෂණ බලපත්‍ර ගණන | பரிந்துரைக்கப்பட்ட சுற்றுச்சூழல் பாதுகாப்பு உரிமம்" },
                        { id: "8", text: "EPL licensing rejected<br>ප්‍රතික්ෂේපිත පරිසර ආරක්ෂණ බලපත්‍ර ගණන | நிராகரிக்கப்பட்ட சுற்றுச்சூழல் பாதுகாப்பு உரிமங்களின் எண்ணிக்கை" }
                    ]
                }
            ]
        },
        {
            sectionId: "D",
            title: "Occupational Health | වෘත්තීය සෞඛ්‍යය | தொழில் துறை ஆரோக்கியம்",
            tables: [
                {
                    type: "grid",
                    title: "1. Number of Factories / work places<br>කර්මාන්ත ශාලා / රැකියා ස්ථාන ගණන | தொழிற்சாலைகள் / வேலை செய்யும் இடங்களின் எண்ணிக்கை",
                    headers: [
                        { text: "No", width: "30px" }, { text: "Description" },
                        { text: "Large (>250)<br>මහා පරිමාණ<br>பெரிய", width: "80px" }, { text: "Medium (50-249)<br>මධ්‍යම පරිමාණ<br>நடுத்தர", width: "80px" },
                        { text: "Small (<50)<br>කුඩා පරිමාණ<br>சிறிய", width: "80px" }, { text: "Informal<br>අවිධිමත්<br>முறைசாரா", width: "80px" }, { text: "Govt<br>රාජ්‍ය<br>அரசு", width: "80px" }
                    ],
                    rows: [
                        { id: "1", text: "Number of Factories/ work places<br>කර්මාන්ත ශාලා / රැකියා ස්ථාන ගණන | தொழிற்சாலைகள் / வேலை செய்யும் இடங்களின் எண்ணிக்கை" },
                        { id: "2", text: "Number inspected<br>සිදුකළ විමර්ශන ගණන | ஆய்வு செய்யப்பட்டவை" },
                        { id: "3", text: "Work places with health issues<br>සෞඛ්‍ය ගැටළු සහිත රැකියා ස්ථාන | சுகாதார பிரச்சினைகள் உள்ளவை" },
                        { id: "4", text: "Work places health issues referred<br>නිවැරදි කිරීම් සඳහා යොමු කරන ලද | பிரச்சினைகள் திருத்த பரிந்துரைக்கப்பட்டவை" },
                        { id: "5", text: "Work places health issues corrected<br>සෞඛ්‍ය ගැටළු නිවැරදි කරන ලද | சுகாதார பிரச்சினைகள் சரிசெய்யப்பட்டவை" },
                        { id: "6", text: "Complaints - work place operations<br>සේවා ස්ථාන මෙහෙයුම් පිළිබඳ පැමිණිලි ගණන | பணியிட செயல்பாடு தொடர்பான புகார்கள்" },
                        { id: "7", text: "Complaints successfully resolved<br>සාර්ථකව විසඳන ලද පැමිණිලි ගණන | வெற்றிகரமாக தீர்க்கப்பட்ட புகார்கள்" },
                        { id: "8", text: "Number of workplaces with sanitary waste disposal<br>සනීපාරක්ෂක අපද්‍රව්‍ය බැහැර කිරීමේ ක්‍රම සහිත | சுகாதார கழிவுகளை அகற்றும் முறைகள் கொண்டவை" },
                        { id: "9", text: "Number of educational programmes<br>අධ්‍යාපනික වැඩසටහන් ගණන | கல்விசார் நிகழ்ச்சிகளின் எண்ணிக்கை" },
                        { id: "10", text: "Number of service programmes<br>සේවා වැඩසටහන් ගණන | சேவை நிகழ்ச்சிகளின் எண்ணிக்கை" }
                    ]
                }
            ]
        },
        {
            sectionId: "E",
            title: "Control of Non-communicable Diseases | බෝ නොවන රෝග පාලනය | தொற்றா நோய் கட்டுப்பாடு",
            tables: [
                {
                    type: "grid",
                    headers: [{ text: "No", width: "30px" }, { text: "Description" }, { text: "Count", width: "120px" }],
                    rows: [
                        { id: "1", text: "Number of programmes conducted<br>සිදුකරන ලද වැඩසටහන් ගණන | நடத்தப்பட்ட நிகழ்ச்சிகளின் எண்ணிக்கை" },
                        { id: "2", text: "Number screened<br>පරීක්ෂාවට ලක් කළ පුද්ගලයින් ගණන | சோதிக்கப்பட்ட நபர்களின் எண்ணிக்கை" },
                        { id: "3", text: "Number traced healthy<br>නිරෝගී අය ලෙස හඳුනාගෙන ඇති පුද්ගලයින් ගණන | ஆரோக்கியமான நபர்களின் எண்ணிக்கை" },
                        { id: "4", text: "Number referred<br>වෛද්‍ය ප්‍රතිකාර සඳහා යොමු කරන ලද පුද්ගලයින් ගණන | மருத்துவ சிகிச்சைக்கு பரிந்துரைக்கப்பட்ட நபர்களின் எண்ணிக்கை" }
                    ]
                }
            ]
        },
        {
            sectionId: "F",
            title: "Rabies Control | ජලභීතිකා රෝගය පාලනය | ரேபிஸின் கட்டுப்பாடு",
            tables: [
                {
                    type: "grid",
                    headers: [{ text: "No", width: "30px" }, { text: "Description" }, { text: "Count", width: "120px" }],
                    rows: [
                        { id: "1", text: "Number of human rabies cases<br>මානව ජලභීතිකා රෝගය රෝගීන් ගණන | மனித ரேபிஸ் நோயாளிகளின் எண்ணிக்கை" },
                        { id: "2", text: "Number of (pets) dogs vaccinated - ARV<br>ජලභීතිකා එන්නත ලබා දුන්, සුරතල් සතුන් ලෙස ඇතිකරන සුනඛයින් ගණන | ரேபிஸ்க்கு எதிராக தடுப்பூசி போடப்பட்ட நாய்கள்" },
                        { id: "3", text: "Number of community dogs vaccinated - ARV<br>ජලභීතිකා එන්නත ලබා දුන්, ප්‍රජා සුනඛයින් ගණන | ரேபிஸ் தடுப்பூசியின் எண்ணிக்கை (சமூக நாய்கள்)" },
                        { id: "4", text: "Number of depo given<br>ලබා දුන් උපත් පාලන එන්නත් ගණන | பிறப்பு கட்டுப்பாட்டு தடுப்பூசிகளின் எண்ணிக்கை" },
                        { id: "5", text: "Number of LRT done<br>සිදුකරන ලද වන්ධ්‍යකරණ සැත්කම් ගණන | கருத்தடை செய்யப்பட்ட நாய்களின் எண்ணிக்கை" }
                    ]
                }
            ]
        },
        {
            sectionId: "G",
            title: "Environmental Pollution Problems | පරිසර දූෂණය සම්බන්ධ ගැටළු | சுற்றுச்சூழல் மாசுபாடு தொடர்பான சிக்கல்கள்",
            tables: [
                {
                    type: "grid",
                    headers: [{ text: "No", width: "30px" }, { text: "Description" }, { text: "Count", width: "120px" }],
                    rows: [
                        { id: "1", text: "Number of complaints received<br>ලැබී ඇති පැමිණිලි ගණන | பெறப்பட்ட புகார்களின் எண்ணிக்கை" },
                        { id: "2", text: "Number detected by PHI<br>මහජන සෞඛ්‍ය පරීක්ෂක විසින් අනාවරණය කරගත් ගැටළු ගණන | பொது சுகாதார பரிசோதகரால் கண்டறியப்பட்ட பிரச்சினைகள்" },
                        { id: "3", text: "Number investigated<br>විමර්ශනය කළ ගැටළු ගණන | விசாரிக்கப்பட்ட பிரச்சினைகள்" },
                        { id: "4", text: "Number settled<br>විසඳූ ගැටළු ගණන | தீர்க்கப்பட்ட பிரச்சினைகள்" },
                        { id: "5", text: "Number referred / notice issued for action<br>යොමුකිරීම් කරන ලද / නිවේදන නිකුත්කළ ගැටළු ගණන | வழங்கப்பட்ட பரிந்துரைகள் / பிரச்சினைகள்" },
                        { id: "6", text: "Number prosecuted<br>පවරන ලද නඩු ගණන | செய்யப்பட்ட வழக்குகளின் எண்ணிக்கை" },
                        { id: "7", text: "Number convicted<br>වරදකරුවන් බවට පත්වූ ගණන | குற்றம் நிரூபிக்கப்பட்டவற்றின் எண்ணிக்கை" },
                        { id: "8", text: "Fined Rs.<br>දඩ මුදල රුපියල් | அபராத தொகை ரூபா" },
                        { id: "9", text: "Number of cases pending<br>විභාග වෙමින් පවතින නඩු ගණන | நிலுவையில் உள்ள வழக்குகளின் எண்ணிக்கை" }
                    ]
                },
                {
                    type: "grid",
                    title: "2. Public complains categorization<br>මහජන පැමිණිලි වර්ගීකරණය | பொது புகார்கள் வகைப்படுத்தல்",
                    headers: [{ text: "No", width: "30px" }, { text: "Description" }, { text: "Count", width: "120px" }],
                    rows: [
                        { id: "1", text: "Pig farms<br>ඌරු ගොවිපලවල් ගණන | பன்றி பண்ணைகள்" },
                        { id: "2", text: "Poultry farms<br>කුකුළු ගොවිපලවල් ගණන | கோழி பண்ணைகள்" },
                        { id: "3", text: "Cattle farms<br>ගව ගොවිපලවල් ගණන | கால்நடை பண்ணைகள்" },
                        { id: "4", text: "Goat farms<br>එළු ගොවිපලවල් ගණන | ஆடு பண்ணைகள்" },
                        { id: "5", text: "Other animal farms<br>වෙනත් සත්ව ගොවිපලවල් ගණන | பிற விலங்கு பண்ணைகள்" },
                        { id: "6", text: "Prawn farms<br>ඉස්සන් ගොවිපලවල් ගණන | இறால் பண்ணைகள்" },
                        { id: "7", text: "Toilets<br>වැසිකිළි ගණන | கழிப்பறைகள்" },
                        { id: "8", text: "Wells<br>ළිං ගණන | கிணறு" },
                        { id: "9", text: "Waste water<br>අප ජලය සහිත ස්ථාන ගණන | கழிவு நீர்" },
                        { id: "10", text: "Vector breeding sites<br>රෝග වාහකයන් බෝවන ස්ථාන ගණන | நோய் காவி பெருகும் இடங்கள்" },
                        { id: "11", text: "Health Institutions<br>සෞඛ්‍ය ආයතන ගණන | சுகாதார நிறுவனங்கள்" },
                        { id: "12", text: "Veterinary institutions<br>පශු වෛද්‍ය ආයතන ගණන | கால்நடை நிறுவனங்கள்" },
                        { id: "13", text: "Air pollution<br>වායු දූෂණය | காற்று மாசுபாடு" },
                        { id: "14", text: "Other complains on public nuisance<br>මහජන කරදර පිළිබඳ වෙනත් පැමිණිලි ගණන | பொது தொல்லை தொடர்பான பிற புகார்கள்" }
                    ]
                }
            ]
        },
        {
            sectionId: "H",
            title: "Vector Control | රෝග වාහකයන් පාලනය | நோய் காவி கட்டுப்பாடு",
            tables: [
                {
                    type: "grid",
                    title: "1. Vector control measures<br>රෝග වාහකයන් පාලනය | நோய் காவி கட்டுப்பாடு",
                    headers: [{ text: "No", width: "30px" }, { text: "Description" }, { text: "Count", width: "120px" }],
                    rows: [
                        { id: "1", text: "Number of premises inspected for mosquito breeding<br>මදුරුවන් බෝවීම සම්බන්ධයෙන් පරීක්ෂා කළ පරිශ්‍ර ගණන | நுளம்பு பரவுதலுக்காக ஆய்வு செய்யப்பட்ட வளாகங்களின் எண்ணிக்கை" },
                        { id: "2", text: "Number of premises with potential breeding sites<br>මදුරුවන් බෝවිය හැකි ස්ථාන සහිත පරිශ්‍ර ගණන | நோய் காவி பெருக்கம் உள்ள இடங்கள் எண்ணிக்கை" },
                        { id: "3", text: "Number of premises with larvae<br>මදුරුකීටයන් සහිත ස්ථාන ගණන | குடம்பி பெருக்கம் கூடிய வளாகங்களின் எண்ணிக்கை" },
                        { id: "4", text: "Number of notices issued<br>නිකුත් කරන ලද දැන්වීම් ගණන | கொடுக்கப்பட்ட அறிவிப்புகளின் எண்ணிக்கை" },
                        { id: "5", text: "Number prosecuted<br>ගොනු කර ඇති නඩු ගණන | வழக்குகளின் எண்ணிக்கை" },
                        { id: "6", text: "Fined Rs.<br>දඩ මුදල රුපියල් | அபராதம் ரூபா" }
                    ]
                },
                {
                    type: "grid",
                    title: "2. Activities Done<br>සිදුකළ ක්‍රියාකාරකම් | இருக்கும் நிறுவனங்கள்",
                    headers: [{ text: "No", width: "30px" }, { text: "Description" }, { text: "Count", width: "120px" }],
                    rows: [
                        { id: "1", text: "Target number to be inspected<br>සැලසුම් කළ පරීක්ෂා කිරීම් ගණන | இருக்கும் நிறுவனங்களின் எண்ணிக்கை" },
                        { id: "2", text: "Number inspected<br>පරීක්ෂා කරන ලද ආයතන ගණන | ஆய்வு செய்யப்பட்ட நிறுவனங்களின் எண்ணிக்கை" },
                        { id: "3", text: "Number of premises with potential breeding sites<br>මදුරුවන් බෝවිය හැකි ස්ථාන සහිත පරිශ්‍ර ගණන | நுளம்பு பெருகும் தளங்களைக் கொண்ட வளாகங்களின் எண்ணிக்கை" },
                        { id: "4", text: "Number of places detected with larvae<br>මදුරුකීටයන් සිටින බවට හඳුනාගන්නා ලද ස්ථාන ගණන | குடம்பிகள் கண்டறியப்பட்ட இடங்களின் எண்ணிக்கை" },
                        { id: "5", text: "Number of notices issued<br>නිකුත් කරන ලද දැන්වීම් ගණන | கொடுக்கப்பட்ட அறிவிப்புகளின் எண்ணிக்கை" },
                        { id: "6", text: "Number prosecuted<br>ගොනු කර ඇති නඩු ගණන | வழக்குகளின் எண்ணிக்கை" },
                        { id: "7", text: "Fined Rs.<br>දඩ මුදල රුපියල් | அபராதம் ரூபா" }
                    ]
                }
            ]
        },
        {
            sectionId: "I",
            title: "Visit to Medical Institutions | වෛද්‍ය ආයතන වෙත ගිය ගමන් වාර | மருத்துவ நிறுவனங்களுக்கான வருகைகள்",
            tables: [
                {
                    type: "grid",
                    title: "(I) Visits to Medical Institutions (Hospitals labs etc.)<br>වෛද්‍ය ආයතන වෙත ගිය ගමන් වාර ගණන (රෝහල් විද්‍යාගාර යනාදිය) | மருத்துவ நிறுவனங்களுக்கான வருகைகள் (மருத்துவமனைகள் ஆய்வகங்கள் போன்றவை)",
                    headers: [{ text: "No", width: "30px" }, { text: "Description" }, { text: "Count", width: "120px" }],
                    rows: [
                        { id: "1", text: "Government sector<br>රාජ්‍ය අංශය | அரசுத் துறை" },
                        { id: "2", text: "Private sector<br>පෞද්ගලික අංශය | தனியார் துறை" }
                    ]
                }
            ]
        },
        {
            sectionId: "J",
            title: "Implementing Tobacco & Alcohol Control Act | දුම්කොළ හා මධ්‍යසාර පාලන පනත ක්‍රියාත්මක කිරීම | புகையிலை மற்றும் மதுபானம் கட்டுப்பாட்டுச் சட்டத்தை அமுல்படுத்தல்",
            tables: [
                {
                    type: "grid",
                    title: "(J) Implementing Tobacco & Alcohol Control Act<br>දුම්කොළ හා මධ්‍යසාර පාලන පනත ක්‍රියාත්මක කිරීම | புகையிலை மற்றும் மதுபானம் கட்டுப்பாட்டுச் சட்டத்தை அமுல்படுத்தல்",
                    headers: [{ text: "No", width: "30px" }, { text: "Description" }, { text: "Count", width: "120px" }],
                    rows: [
                        { id: "1", text: "Number of places inspected<br>පරීක්ෂා කළ ස්ථාන ගණන | ஆய்வு செய்யப்பட்ட இடங்களின் எண்ணிக்கை" },
                        { id: "2", text: "Number of places with problems<br>ගැටළු සහිත ස්ථාන ගණන | பிரச்சினைகள் உள்ள இடங்களின் எண்ணிக்கை" },
                        { id: "3", text: "Number prosecuted<br>ගොනු කර ඇති නඩු ගණන | வழக்குகளின் எண்ணிக்கை" },
                        { id: "4", text: "Fined Rs.<br>දඩ මුදල රුපියල් | அபராதம் ரூபா" }
                    ]
                }
            ]
        },
        {
            sectionId: "K",
            title: "Implementing Pesticide Act | පලිබෝධ නාශක පාලන පනත | பூச்சிக்கொல்லி சட்டம்",
            tables: [
                {
                    type: "grid",
                    title: "(K) Implementing of Pesticide Control Act<br>පලිබෝධ නාශක පාලන පනත යටතේ ක්‍රියාකරකම් | பூச்சிக்கொல்லி கட்டுப்பாட்டு சட்டத்தை அமுல்படுத்தல்",
                    headers: [{ text: "No", width: "30px" }, { text: "Description" }, { text: "Count", width: "120px" }],
                    rows: [
                        { id: "1", text: "Number of places inspected<br>පරීක්ෂා කළ ස්ථාන ගණන | ஆய்வு செய்யப்பட்ட இடங்களின் எண்ணிக்கை" },
                        { id: "2", text: "Number of places with problems<br>ගැටළු සහිත ස්ථාන ගණන | பிரச்சினைகள் உள்ள இடங்களின் எண்ணிக்கை" },
                        { id: "3", text: "Number corrected<br>නිවැරදි කිරීම් සිදුකළ ස්ථාන ගණන | சரிசெய்யப்பட்ட சிக்கல்களின் எண்ணிக்கை" },
                        { id: "4", text: "Number taken legal action<br>නීතිමය පියවර ගන්නා ලද ස්ථාන ගණන | சட்ட நடவடிக்கை எடுக்கப்பட்ட சிக்கல்களின் எண்ணிக்கை" }
                    ]
                }
            ]
        },
        {
            sectionId: "L",
            title: "Volunteer Programmes | ස්වේච්ඡා වැඩසටහන් | தன்னார்வ நிகழ்ச்சிகள்",
            tables: [
                {
                    type: "grid",
                    title: "(L) Volunteer Programmes<br>ස්වේච්ඡා වැඩසටහන් | தன்னார்வ நிகழ்ச்சிகள்",
                    headers: [{ text: "No", width: "30px" }, { text: "Description" }, { text: "Count", width: "120px" }],
                    rows: [
                        { id: "1", text: "<b>1. Number of volunteers in area</b><br>ප්‍රදේශයේ සිටින ස්වේච්ඡා සේවකයන් ගණන | இப்பகுதியில் உள்ள தன்னார்வலர்களின் எண்ணிக்கை" },
                        { id: "1.1", text: "&nbsp;&nbsp;&nbsp;Male<br>&nbsp;&nbsp;&nbsp;පිරිමි | ஆண்" },
                        { id: "1.2", text: "&nbsp;&nbsp;&nbsp;Female<br>&nbsp;&nbsp;&nbsp;කාන්තා | பெண்" },
                        { id: "2", text: "<b>2. Training of volunteers</b><br>ස්වේච්ඡා සේවකයන් පුහුණු කිරීම | தொண்டர்களுக்கு பயிற்சி" },
                        { id: "2.1", text: "&nbsp;&nbsp;&nbsp;Number recruited during the month<br>&nbsp;&nbsp;&nbsp;මෙම මාසය තුළ බඳවා ගත් ගණන | மாதத்தில் ஆட்சேர்ப்பு செய்யப்பட்ட தன்னார்வலர்களின் எண்ணிக்கை" },
                        { id: "2.2", text: "&nbsp;&nbsp;&nbsp;Number of programmes<br>&nbsp;&nbsp;&nbsp;වැඩසටහන් ගණන | நிகழ்ச்சிகளின் எண்ணிக்கை" },
                        { id: "2.3", text: "&nbsp;&nbsp;&nbsp;Number trained<br>&nbsp;&nbsp;&nbsp;පුහුණුව ලැබූ පුද්ගලයින් ගණන | பயிற்சி பெற்ற தன்னார்வலர்களின் எண்ணிக்கை" }
                    ]
                }
            ]
        },
        {
            sectionId: "M",
            title: "Health Education Programmes | සෞඛ්‍ය අධ්‍යාපන වැඩසටහන් | சுகாதார கல்வி திட்டங்கள்",
            tables: [
                {
                    type: "grid",
                    title: "(M) Health Education Programmes<br>සෞඛ්‍ය අධ්‍යාපන වැඩසටහන් | சுகாதார கல்வி திட்டங்கள்",
                    headers: [{ text: "No", width: "30px" }, { text: "Description" }, { text: "Count", width: "120px" }],
                    rows: [
                        { id: "1", text: "Food safety<br>ආහාර ආරක්ෂාව | உணவு பாதுகாப்பு" },
                        { id: "2", text: "Non communicable diseases<br>බෝ නොවන රෝග | தொற்றா நோய்கள்" },
                        { id: "3", text: "Communicable diseases<br>බෝවන රෝග | தொற்று நோய்கள்" },
                        { id: "4", text: "Pest control<br>පලිබෝධ පාලනය | பூச்சி கட்டுப்பாடு" },
                        { id: "5", text: "Others<br>වෙනත් | ஏனையவை" }
                    ]
                }
            ]
        },
        {
            sectionId: "N",
            title: "Welfare Centers | සුබසාධන මධ්‍යස්ථාන | நல மையங்கள்",
            tables: [
                {
                    type: "grid",
                    title: "(N) Welfare Centers<br>සුබසාධන මධ්‍යස්ථාන | நல மையங்கள்",
                    headers: [
                        { text: "No", width: "30px" }, { text: "Description" },
                        { text: "1 Number<br>ගණන | எண்", width: "100px" },
                        { text: "2 Visits Done<br>සිදුකළ චාරිකා ගණන | வருகைகளின் எண்ணிக்கை", width: "100px" }
                    ],
                    rows: [
                        { id: "1", text: "Centers for displaced persons<br>අවතැන් වූ පුද්ගලයන් සඳහා මධ්‍යස්ථාන | இடம்பெயர்ந்தோருக்கான மையங்கள்" },
                        { id: "2", text: "Day care centers<br>දිවා සුරැකුම් මධ්‍යස්ථාන | பகல்நேர பராமரிப்பு மையங்கள்" },
                        { id: "3", text: "Elderly / children homes & others<br>මහලු නිවාස / ළමා නිවාස සහ වෙනත් | முதியவர்கள் / குழந்தைகள் வீடுகள் மற்றும் பிற" }
                    ]
                }
            ]
        },
        {
            sectionId: "O",
            title: "Festival Sanitation | උත්සව සනීපාරක්ෂාව | விழா சனிபராசுஷாவ",
            tables: [
                {
                    type: "grid",
                    title: "(O) Festival Sanitation<br>උත්සව සනීපාරක්ෂාව | விழா சனிபராசுஷாவ",
                    headers: [{ text: "No", width: "30px" }, { text: "Description" }, { text: "Count", width: "120px" }],
                    rows: [
                        { id: "1", text: "Functioning festivals - Guested<br>ක්‍රියාත්මක වන උත්සව - ආරාධිත" },
                        { id: "2", text: "Functioning festivals - Non-guested<br>ක්‍රියාත්මක වන උත්සව - ආරාධිත නොවන" },
                        { id: "3", text: "Number of inspections<br>පරීක්ෂා කිරීම් ගණන | ஆய்வுகளின் எண்ணிக்கை" },
                        { id: "4", text: "Number of food premises inspected<br>පරීක්ෂා කරන ලද ආහාර පරිශ්‍ර ගණන | ஆய்வு செய்யப்பட்ட உணவு வளாகங்களின் எண்ணிக்கை" },
                        { id: "5", text: "Number of premises unsatisfactory<br>අසතුටුදායක පරිශ්‍ර ගණන | திருப்தியற்ற வளாகங்களின் எண்ணிக்கை" },
                        { id: "6", text: "Prosecuted<br>නඩු පවරන ලද ගණන | வழக்கு தொடரப்பட்டவர்களின் எண்ணிக்கை" },
                        { id: "7", text: "Convicted<br>වරදකරුවන් ගණන | குற்றம் நிரூபிக்கப்பட்டவற்றின் எண்ணிக்கை" },
                        { id: "8", text: "Fined Rs.<br>දඩ මුදල රුපියල් | அபராதம் ரூபா" }
                    ]
                }
            ]
        },
        {
            sectionId: "P",
            title: "Business Registration/Trade Licence | ව්‍යාපාර ලියාපදිංචිය/වෙළඳ බලපත්‍රය | வணிகப் பதிவு/வர்த்தக உரிமம்",
            tables: [
                {
                    type: "grid",
                    title: "(P) Business Registration/Trade Licence<br>ව්‍යාපාර ලියාපදිංචිය/වෙළඳ බලපත්‍රය | வணிகப் பதிவு/வர்த்தக உரிமம்",
                    headers: [{ text: "No", width: "30px" }, { text: "Description" }, { text: "Count", width: "120px" }],
                    rows: [
                        { id: "1", text: "Number of applications received<br>ලැබුණු අයදුම්පත් ගණන | பெறப்பட்ட விண்ணப்பங்களின் எண்ணிக்கை" },
                        { id: "2", text: "Number inspected<br>පරීක්ෂා කළ ගණන | பரிசோதிக்க கணன" },
                        { id: "3", text: "Recommended to registration<br>ලියාපදිංචිය සඳහා නිර්දේශ කළ ගණන | பதிவு செய்ய பரிந்துரைக்கப்பட்ட கணன" }
                    ]
                }
            ]
        },
        {
            sectionId: "Q",
            title: "Special Programmes & Recommendations | විශේෂ වැඩසටහන් & නිර්දේශ | சிறப்பு நிகழ்ச்சிகள் & பரிந்துரைகள்",
            tables: [
                {
                    type: "textarea-list",
                    rows: [
                        { id: "1", text: "Special programmes conducted , participated<br>පැවැත්වූ/සහභාගී වූ විශේෂ වැඩසටහන් | நடத்தப்பட்ட / பங்கேற்ற சிறப்பு நிகழ்ச்சிகள்" },
                        { id: "2", text: "Observations of SPHI<br>ජ්‍යෙෂ්ඨ මහජන සෞඛ්‍ය පරීක්ෂකගේ නිරීක්ෂණ | மேற்பார்வை பொது சுகாதார பரிசோதகரின் அவதானிப்புகள்" },
                        { id: "3", text: "Observations of MOH<br>සෞඛ්‍ය වෛද්‍ය නිලධාරීගේ නිරීක්ෂණ | சுகாதார மருத்துவ அதிகாரியின் அவதானிப்புகள்" }
                    ]
                }
            ]
        }
    ];

    function countRows(item) {
        if (!item.children || item.children.length === 0) return 1;
        return item.children.reduce((acc, child) => acc + countRows(child), 0);
    }

    function getMaxDepth(items, currentDepth = 1) {
        let max = currentDepth;
        items.forEach(item => {
            if (item.children) {
                const d = getMaxDepth(item.children, currentDepth + 1);
                if (d > max) max = d;
            }
        });
        return max;
    }

    function renderTreeRows(items, depth, maxDepth, sectionId, rows = [], currentRow = 0) {
        if (rows.length === 0) {
            const totalRows = items.reduce((acc, it) => acc + countRows(it), 0);
            for (let i = 0; i < totalRows; i++) rows.push([]);
        }
        let currentR = currentRow;
        items.forEach(item => {
            const h = countRows(item);
            const isLeaf = !item.children;
            rows[currentR].push({ tag: 'td', html: item.id, rowspan: h, class: 'report-id-cell' });
            let colspan = 1;
            if (isLeaf) colspan = 1 + ((maxDepth - depth) * 2);
            const cellClass = isLeaf ? 'report-text-cell' : 'report-text-cell report-parent-cell';
            rows[currentR].push({ tag: 'td', html: item.text, rowspan: h, colspan: colspan, class: cellClass });
            if (isLeaf) {
                rows[currentR].push({ tag: 'td', html: `<input type="number" class="report-input">`, class: 'report-input-cell' });
            } else {
                renderTreeRows(item.children, depth + 1, maxDepth, sectionId, rows, currentR);
            }
            currentR += h;
        });
        return rows;
    }

    window.openMonthlyReport = function () {
        const content = document.getElementById("contentArea");
        if (!content) return;

        const css = `
            .report-table { width: 100%; border-collapse: collapse; margin-top: 5px; margin-bottom: 25px; font-family: "Noto Sans Sinhala", sans-serif; table-layout: fixed; font-size: 13px; }
            .report-table td, .report-table th { border: 1px solid #999; padding: 5px; vertical-align: middle; word-wrap: break-word; }
            .report-table th { background: #d0dbe2; font-weight: bold; font-size: 12px; text-align: left; color: #000; border-bottom: 2px solid #999; }
            .report-id-cell { font-weight: bold; width: 30px; text-align: center; background: #f0f0f0; vertical-align: top !important; padding-top: 8px !important; }
            .report-text-cell { line-height: 1.4; color: #000; text-align: left; }
            .report-parent-cell { background-color: #f7f7f7; font-weight: 600; }
            .report-input-cell { padding: 4px !important; background: #f0f0f0; width: 100px; }
            .report-input { width: 100%; box-sizing: border-box; border: 1px solid #000; padding: 4px; font-size: 14px; text-align: center; outline: none; background: #fff; border-radius: 4px; height: 32px; }
            .report-input:focus { border-color: var(--primary); background: #f0f8ff; box-shadow: 0 0 0 2px rgba(0,0,0,0.1); }
            .section-title { font-size: 16px; font-weight: bold; margin-top: 20px; margin-bottom: 10px; color: var(--primary); border-bottom: 2px solid #ddd; padding-bottom: 5px; }
            .table-title { font-size: 13px; font-weight: bold; margin-bottom: 5px; color: #000; background: #d0dbe2; padding: 6px; border: 1px solid #999; border-bottom: none; }
            
            @media screen and (max-width: 600px) {
                .report-table-wrapper { overflow-x: auto; margin-bottom: 15px; border: 1px solid #eee; -webkit-overflow-scrolling: touch; }
                .report-table { min-width: 700px; } 
                .section-title { font-size: 14px; }
                .header-controls { flex-direction: column; align-items: flex-start; gap: 10px; }
                .header-controls > div { width: 100%; display: flex; gap: 10px; }
                .report-input { min-height: 40px; font-size: 16px; } /* Stop iOS zoom on focus */
            }

            @media print {
                @page { size: A4 landscape; margin: 5mm; }
                
                /* Reset Body */
                body { 
                    background: #fff !important; 
                    -webkit-print-color-adjust: exact !important; 
                    print-color-adjust: exact !important;
                    height: auto !important;
                    overflow: visible !important;
                }

                /* HIDE SIBLINGS & UI*/
                .header, .sidebar, #mobileOverlay, .mobile-toggle, .no-print, .header-controls, .nav-links, button {
                    display: none !important;
                }

                /* RESET WRAPPERS */
                .container, .main, .content {
                    width: 100% !important;
                    height: auto !important;
                    margin: 0 !important;
                    padding: 0 !important;
                    position: static !important;
                    display: block !important;
                    overflow: visible !important;
                    background: transparent !important;
                    border: none !important;
                    box-shadow: none !important;
                    transform: none !important; /* Remove any GPU layer issues */
                    filter: none !important;    /* Remove glass effects */
                    backdrop-filter: none !important;
                }
                
                #contentArea {
                    width: 100% !important;
                    display: block !important;
                    visibility: visible !important;
                }
                
                /* Ensure visibility of everything inside contentArea */
                #contentArea * { visibility: visible !important; }

                /* Force Table Styles to match Screen */
                .report-table { width: 100% !important; table-layout: fixed !important; border-collapse: collapse !important; font-size: 11px !important; }
                .report-table th { background: #d0dbe2 !important; color: #000 !important; font-weight: bold !important; text-align: left !important; border: 1px solid #999 !important; }
                .report-table td { border: 1px solid #999 !important; padding: 4px !important; }
                
                /* Input Fields - Keep EXACT look */
                .report-input-cell { background: #f0f0f0 !important; width: 100px !important; padding: 4px !important; }
                .report-input { 
                    border: 1px solid #000 !important; 
                    background: #fff !important; 
                    width: 100% !important; 
                    height: 32px !important; 
                    display: block !important;
                    text-align: center !important;
                    font-size: 12px !important;
                    box-sizing: border-box !important;
                }

                /* Section Titles */
                .section-title { 
                    font-size: 16px !important; 
                    font-weight: bold !important; 
                    color: #0b5ea8 !important; /* var(--primary) resolved */
                    border-bottom: 2px solid #ddd !important; 
                    margin-top: 20px !important;
                }
                
                .table-title { background: #d0dbe2 !important; font-weight: bold !important; color: #000 !important; border: 1px solid #999 !important; border-bottom: none !important; }
                .report-parent-cell { background-color: #f7f7f7 !important; }
                .report-id-cell { background: #f0f0f0 !important; }

                /* Prevent page breaks inside rows if possible */
                tr { page-break-inside: avoid; }
            }
        `;
        const style = el("style", { html: css });

        content.innerHTML = "";
        content.appendChild(style);

        const header = el("div", { class: "header-controls", style: "display:flex;justify-content:space-between;align-items:center;margin-bottom:15px;flex-wrap:wrap;gap:10px;" });

        const titleArea = el("div", { style: "display:flex; flex-direction:column;" });
        const h2 = el("h2", { text: "H631 (Part 2) - PHI Monthly Report", style: "color:var(--primary);margin:0;font-size:20px;" });
        titleArea.appendChild(h2);

        const controlsArea = el("div", { style: "display:flex; gap:10px; align-items:center;" });

        // Month Selector
        const monthSelect = el("select", { style: "padding:6px; border-radius:4px; border:1px solid #ccc; font-size:14px;" });
        const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
        months.forEach((m, idx) => {
            const opt = el("option", { value: idx + 1, text: m });
            if (idx === new Date().getMonth()) opt.selected = true;
            monthSelect.appendChild(opt);
        });

        // Year Selector
        const yearSelect = el("select", { style: "padding:6px; border-radius:4px; border:1px solid #ccc; font-size:14px;" });
        const currentYear = new Date().getFullYear();
        for (let y = currentYear - 2; y <= currentYear + 2; y++) {
            const opt = el("option", { value: y, text: y });
            if (y === currentYear) opt.selected = true;
            yearSelect.appendChild(opt);
        }

        const printBtn = el("button", { class: "no-print", style: "background:#28a745;color:#fff;padding:6px 12px;border-radius:6px;border:none;cursor:pointer;font-weight:600;display:flex;align-items:center;gap:5px;", html: '<i class="fas fa-print"></i> Print' });
        printBtn.onclick = () => window.print();

        const backBtn = el("button", { class: "no-print", style: "background:var(--primary);color:#fff;padding:6px 12px;border-radius:6px;border:none;cursor:pointer;font-weight:600;", html: '<i class="fas fa-arrow-left"></i> Back' });
        backBtn.onclick = () => window.showContent && window.showContent('Reports', null);

        controlsArea.appendChild(monthSelect);
        controlsArea.appendChild(yearSelect);
        controlsArea.appendChild(printBtn);
        controlsArea.appendChild(backBtn);

        header.appendChild(titleArea);
        header.appendChild(controlsArea);
        content.appendChild(header);

        const nav = el("div", { class: "nav-links no-print", style: "margin-bottom:15px; font-size:12px; color:#0056b3; line-height: 1.6; background:#fff; padding:15px; border-radius:10px; box-shadow:0 2px 10px rgba(0,0,0,0.05);" });
        reportData.forEach((sect, i) => {
            const shortTitle = sect.title.split('|')[0].trim();
            const a = el("a", { text: `${sect.sectionId}. ${shortTitle}`, style: "cursor:pointer;color:#0056b3;text-decoration:none;" });
            a.onclick = () => {
                const target = document.getElementById("sec-" + sect.sectionId);
                if (target) target.scrollIntoView({ behavior: "smooth" });
            };
            a.onmouseover = () => a.style.textDecoration = "underline";
            a.onmouseout = () => a.style.textDecoration = "none";
            nav.appendChild(a);
            if (i < reportData.length - 1) nav.appendChild(document.createTextNode(" | "));
        });
        content.appendChild(nav);

        const formContainer = el("div", { class: "report-form-container", style: "background:#fff;padding:20px;border-radius:10px;box-shadow:0 2px 10px rgba(0,0,0,0.05);" });

        reportData.forEach(sect => {
            const h3 = el("div", { id: "sec-" + sect.sectionId, class: "section-title", text: sect.sectionId + ". " + sect.title });
            formContainer.appendChild(h3);

            sect.tables.forEach(tbl => {
                if (tbl.title) {
                    const tt = el("div", { class: "table-title", html: tbl.title });
                    formContainer.appendChild(tt);
                }
                const tableWrapper = el("div", { class: "report-table-wrapper" });
                const table = el("table", { class: "report-table" });
                if (tbl.type === "tree") {
                    const maxDepth = getMaxDepth(tbl.items);

                    const colgroup = el("colgroup");
                    const totalCols = maxDepth * 2 + 1;
                    for (let c = 0; c < totalCols; c++) {
                        const col = el("col");
                        if (c === totalCols - 1) {
                            col.style.width = "100px";
                        } else if (c % 2 === 0) {
                            col.style.width = "30px";
                        } else {
                            col.style.width = "auto";
                        }
                        colgroup.appendChild(col);
                    }
                    table.appendChild(colgroup);

                    const matrix = renderTreeRows(tbl.items, 1, maxDepth, sect.sectionId);
                    matrix.forEach(rowCells => {
                        const tr = el("tr");
                        rowCells.forEach(cell => {
                            const td = el(cell.tag, { rowspan: cell.rowspan || 1, colspan: cell.colspan || 1, html: cell.html, class: cell.class });
                            tr.appendChild(td);
                        });
                        table.appendChild(tr);
                    });
                    tableWrapper.appendChild(table);
                    formContainer.appendChild(tableWrapper);
                } else if (tbl.type === "grid") {
                    const colgroup = el("colgroup");
                    tbl.headers.forEach((h, i) => {
                        const col = el("col");
                        if (i === 0) col.style.width = "30px";
                        else if (i === 1) col.style.width = "auto";
                        else col.style.width = h.width || "150px";
                        colgroup.appendChild(col);
                    });
                    table.appendChild(colgroup);

                    const thead = el("tr");
                    tbl.headers.forEach(h => {
                        const th = el("th", { html: h.text });
                        // Width logic handled by colgroup now
                        thead.appendChild(th);
                    });
                    table.appendChild(thead);
                    tbl.rows.forEach(r => {
                        const tr = el("tr");
                        tr.appendChild(el("td", { class: "report-id-cell", html: r.id }));
                        tr.appendChild(el("td", { class: "report-text-cell", html: r.text }));
                        const numInputs = tbl.headers.length - 2;
                        for (let k = 0; k < numInputs; k++) {
                            const td = el("td", { class: "report-input-cell" });
                            const type = tbl.inputType === "text" ? "text" : "number";
                            const inp = el("input", { type: type, class: "report-input" });
                            if (type === "text") inp.style.textAlign = "left";
                            td.appendChild(inp);
                            tr.appendChild(td);
                        }
                        table.appendChild(tr);
                    });
                    tableWrapper.appendChild(table);
                    formContainer.appendChild(tableWrapper);
                } else if (tbl.type === "textarea-list") {
                    tbl.rows.forEach(r => {
                        const wrapper = el("div", { style: "border:1px solid #999; margin-bottom:15px; break-inside: avoid; background:#fff;" });
                        const header = el("div", {
                            html: `<b>${r.id}</b> ${r.text}`,
                            style: "background:#cfd8dc; padding:8px 10px; border-bottom:1px solid #999; font-weight:bold; font-size:12px; color:#000;"
                        });
                        const body = el("div", { style: "padding:10px;" });
                        const textarea = el("textarea", { class: "report-textarea", style: "width:100%; height:100px; padding:8px; border:1px solid #ccc; font-family:inherit; font-size:13px; resize:vertical; box-sizing:border-box;" });

                        body.appendChild(textarea);
                        wrapper.appendChild(header);
                        wrapper.appendChild(body);
                        formContainer.appendChild(wrapper);
                    });
                }
            });
        });

        const saveArea = el("div", { class: "no-print", style: "margin-top:20px;text-align:right;" });
        const saveBtn = el("button", { text: "Save Report", style: "background:var(--primary);color:#fff;padding:10px 20px;border:none;border-radius:8px;cursor:pointer;" });
        saveBtn.onclick = () => alert("Save to Firebase: Pending Implementation");
        saveArea.appendChild(saveBtn);
        formContainer.appendChild(saveArea);

        content.appendChild(formContainer);
    };

})();
