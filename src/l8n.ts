import LocalizedStrings from "react-localization";

export const EnglishLanguageProperties: ILanguageProperties = {
    localeName: "en",
    friendlyName: "English",
    isRtl: false
};

export const ArabicLanguageProperties: ILanguageProperties = {
    localeName: "ar",
    friendlyName: "اللغة العربية",
    isRtl: true
};

export interface ILanguageProperties {
    localeName: string;
    friendlyName: string;
    isRtl: boolean;
}

export const strings = new LocalizedStrings({
    en: {
        "noContent": "The page you are looking for is not found. Please check the address and try again.",
        "switchLang": "اللغة العربية",
        "home": "Home",
        "seasons": "Seasons",
        "types": "Types",
        "tunes": "Tunes",
        "booklets": "Booklets",
        "fonts": "Fonts",
        "help": "Help",
        "contactUs": "Contact Us",
        "otherServices": "Other Services",
        "loading": "Loading...",
        "noSeasons": "No seasons to display",
        "noTypes": "No hymn types to display",
        "noTunes": "No hymn tunes to display",
        "noBooklets": "No booklets to display",
        "followUs": "Follow Us",
        "menu": "Menu",
        "seasonTitle": "{0} Hymns",
        "textFormatName": "Text",
        "hazzatFormatName": "Hazzat",
        "verticalHazzatFormatName": "Vertical Hazzat",
        "musicFormatName": "Musical Notes",
        "audioFormatName": "Audio",
        "videoFormatName": "Video",
        "informationFormatName": "Information",
        "contentNotFoundMessage": "The content you are looking for cannot be found...",
        "goBack": "Go back",
        "musicalNotesLinkSuffix": "Musical Notes",
        "musicAudioLinkSuffix": "Instrumental Audio",
        "audioLinkSuffix": "Audio",
        "numeric0": "0",
        "numeric1": "1",
        "numeric2": "2",
        "numeric3": "3",
        "numeric4": "4",
        "numeric5": "5",
        "numeric6": "6",
        "numeric7": "7",
        "numeric8": "8",
        "numeric9": "9",
        "forPrinting": "For Printing",
        "forPrintingDesc": "Pages are ordered as a booklet style. The page order will be correct once it is assembled as a booklet.",
        "forDevices": "For Devices",
        "forDevicesDesc": "Pages are ordered sequentially for touch friendly devices.",
        "hazzatFont": "Hazzat Font",
        "hazzatFontVer": "Hazzat Font v1.10a",
        "hazzatFontDesc": "This font is a freeware, to be shared by Copts and non-Copts all over the world. Just one request from author...Please share your hymns with everybody for teaching purpose. Thank you, and may God reward you.",
        "copticFonts": "Coptic Fonts",
        "copticZipTitle": "A zip file containing the following Coptic Fonts:",
        "copticZipContents": "Antonious 1<br />Athanasius<br />Avva_Bishoy<br />Avva_Kyrillos<br />Avva_Marcos<br />Avva_Shenouda<br />AvvaMarkos<br />Bishop Tadros<br />Copt<br />Coptic<br />Coptic1<br />CopticII<br />Coptonew<br />CS Avva Shenouda<br />CS Copt<br />CS Coptic Manuscript<br />CS Copto Manuscript<br />CS Koptos Manuscript<br />CS New Athanasius<br />CS Pishoi<br />Faith Ornaments<br />Koptos<br />Kyrillos<br />MENA 1<br />New Athanasius<br />Nopher<br />Pishoi<br />Pope Shenouda III<br />Saint Marina<br />SaintAbraham<br />SaintGeorges<br />SPAchmim",
        "save": "Save",
        "downloadAllCopticFonts": "Download all Coptic fonts",
        "hazzatFontReason": "This font is made in order to make long Coptic hymns easier to learn. The idea is to put certain notes between the Coptic letters in order to follow along with the hymn. The hymn notes are not complicated. As a result, a person that doesn’t know the hymn could not chant it just by reading the notes, but should listen to the hymn and be familiar with the melody, and the Hazzat font will guide the chanter through the transition points in the melody.<br /></br />The Hazzat font is not a new idea, but it has been used by the Coptic Church (mainly the deacons) for a long time. However, this is the first time to be made into a font. The idea is to make the following feasible:",
        "hazzatAdvantagesList": "<li>Store all hymns on the computer, instead of papers all around.</li><li>Be able to share these hymns with friends.</li><li>Post these hymns on the internet for teaching.</li><li>Make it look nice and uniform.</li><li>Set a standard for other fonts for the same purpose.</li>",
        "hazzatDescSummary": "This font is a <span style=\"color: red\">freeware</span>, to be shared by Copts and non-Copts all over the world. Just one request from author... <span style=\"color: red\">Please share your hymns with everybody</span> for teaching purpose. Thank you, and may God reward you.",
        "enlargePic": "Click on the picture to enlarge in a new window",
        "downloadHazzatFont": "Download Hazzat Font v1.10a",
        "yourContactInfo": "Your Contact Information",
        "yourFeedback": "Your Feedback",
        "nameFormLabel": "Name:",
        "emailFormLabel": "Email:",
        "subjectFormLabel": "Subject:",
        "messageFormLabel": "Message:",
        "submitFormLabel": "Send Feedback",
        "nameRequiredErrorText": "Name is required",
        "emailRequiredErrorText": "Email is required",
        "emailInvalidErrorText": "Email is invalid",
        "subjectRequiredErrorText": "Subject is required",
        "messageRequiredErrorText": "Message is required",
        "feedbackThankYouMessage": "Thank you for your feedback!",
        "feedbackGetBackMessage": "We will get back to you as soon as possible.",
        "feedbackSubmitAnotherMessage": "Submit another message",
        "hazzatFontHelp": "Hazzat Font Help",
        "insallingFonts": "Installing the fonts",
        "instructionsForWinXP": "Instructions for Windows XP",
        "instructionsForWin7": "Instructions for Windows 7",
        "usingTheFonts": "Using the fonts",
        "usingTheHazzatFont": "Using the Hazzat font",
        "usingTheVerticalHazzatFont": "Using the Vertical Hazzat font",
        "hazzatKeybdMap": "Hazzat Font keyboard map",
        "smallLetters": "Small letters",
        "capitalLetters": "Capital letters",
        "keyboardMap": "Keyboard map",
        "downloadAndSaveZip": "Download the zip file and click Save.",
        "extractZip": "Extract the zip file to your desktop",
        "ctrPanelFonts": "Double click on Control Panel > Fonts",
        "fileInstallFont": "Click on \"File\" > \"Install New Font\"",
        "browseAndOK": "Browse to your Desktop where you extracted the Hazzat font, select it, and click OK.",
        "browseAndSelect": "Browse to the folder containing the extracted font files and select all fonts",
        "clickAndInstall": "Right click on the fonts and select \"Install\"",
        "topics": "Topics",
        "aboutHelp": "About this Help Page",
        "aboutHazzat": "About the Hazzat Font",
        "keyMappings": "Key Mappings",
        "usage": "Usage",
        "regularNotes": "Regular Notes",
        "shortNotes": "Short Notes",
        "highNotes": "High Notes",
        "regularExtend": "Regular Note Extenders",
        "vibratedNotes": "Vibrated Notes",
        "specialChars": "Special Characters",
        "abrupt": "To transition abruptly to next character",
        "fastChant": "To notate a part to be chanted fast",
        "breathMark": "For a breath mark or a pause/break",
        "lowerOrHigher": "To notate lower or higher tones",
        "repeatMark": "For repeats",
        "markingChars": "To mark a certain part",
        "exampleHymn": "Example Hymn",
        "helpfulTip": "Helpful Tip",
        "aboutHelpContent": "This help file is written in order to familiarize the user with the font, and why the key mappings were set this way. Please read the entire help file before using the font. Reading the documentation for the Hazzat font will make it much easier for the user, and faster when writing hymns.",
        "key": "Key",
        "symbol": "Symbol",
        "description": "Description",
        "oneNote": "one note",
        "twoNotes": "two notes",
        "threeNotes": "three notes",
        "fourNotes": "four notes",
        "fiveNotes": "five notes",
        "sixNotes": "six notes",
        "sevenNotes": "seven notes",
        "oneShortNote": "one short note",
        "twoShortNotes": "two short notes",
        "threeShortNotes": "three short notes",
        "fourShortNotes": "four short notes",
        "fiveShortNotes": "five short notes",
        "sixShortNotes": "six short notes",
        "sevenShortNotes": "seven short notes",
        "firstExtender": "first note extender",
        "secondExtender": "second note extender",
        "thirdExtender": "third note extender",
        "fourthExtender": "fourth note extender",
        "fifthExtender": "fifth note extender",
        "sixthExtender": "sixth note extender",
        "seventhExtender": "seventh note extender",
        "oneHighNote": "one high note",
        "twoHighNotes": "two high notes",
        "threeHighNotes": "three high notes",
        "fourHighNotes": "four high notes",
        "fiveHighNotes": "five high notes",
        "sixHighNotes": "six high notes",
        "secondVibrated": "second note vibrated (in place after character)",
        "thirdVibrated": "third note vibrated (in place after character)",
        "fourthVibrated": "fourth note vibrated (in place after character)",
        "fifthVibrated": "fifth note vibrated (in place after character)",
        "sixthVibrated": "sixth note vibrated (in place after character)",
        "abruptNote": "change abruptly to next character",
        "fastUnderscore": "chant fast underscore (in place after character)",
        "fastArrow": "chant fast arrowhead (in place after character)",
        "pauseMark": "pause / breath mark",
        "higherTone": "higher tone",
        "lowerTone": "lower tone",
        "repeatOne": "repeat one time",
        "repeatTwo": "repeat two times",
        "repeatThree": "repeat three times",
        "repeatFour": "repeat four times",
        "repeatFive": "repeat five times",
        "repeatSix": "repeat six times",
        "repeatSeven": "repeat seven times",
        "repeatEight": "repeat eight times",
        "repeatNine": "repeat nine times",
        "zeroNote": "zero",
        "markOne": "mark number one",
        "markTwo": "mark number two",
        "markThree": "mark number three",
        "markFour": "mark number four",
        "markFive": "mark number five",
        "markSix": "mark number six",
        "markSeven": "mark number seven",
        "regularDesc1": "There are up to seven consecutive notes that could be obtained by pressing:",
        "for": "for",
        "helpTip": "Tip",
        "regularTip": "Look at your keyboard and locate the letter \"z\". This is the key for 1 note. Right next to it is \"x\" and that's 2 notes. Then \"c\" for 3, \"v\" for 4, \"b\" for 5, \"n\" for 6, and finally \"m\" for 7 notes. Get the picture?",
        "regularDesc2": "Also, you could combine 2 similar notes next to each other to make them longer. Here are 3 long notes for example:",
        "threeLongNotes": "three long notes",
        "regularDesc3": "Or, you could combine 2 different regular notes to get the effect for different note length, such as:",
        "twoLongOneReg": "2 long notes then a regular note",
        "oneLongThreeReg": "1 long note then 3 regular notes",
        "shortDesc1": "Also, there are up to seven consecutive short notes that could be obtained by pressing:",
        "shortTip": "The locations of the 7 short notes are similar to the regular notes, but they are located on the top row. The notes start from \"q\" for 1 short note, and ending with \"u\" for 7 short notes.",
        "highDesc1": "There are up to seven consecutive high notes that could be obtained by pressing:",
        "highTip": "Note that the high notes could be obtained by using the shift key plus the usual key for the regular notes. As for the 7th high note, you would use the same key as the 7 regular since seven notes are the maximum number of consecutive notes you could have. So you would use the small letter \"m\" for that.",
        "highDesc2": "Again, the same idea with the regular notes, you could combine 2 consecutive notes to get the effect of different note lengths, for example:",
        "extendDesc1": "Regular note extenders are used to extend any specific note in order to make it longer.",
        "extendTip1": "For the first note extender, use the same key as 1 note \"z\". As for the 7th note extender, use \"Z\" which is the key for 1 high note.",
        "extendTip2": "To extend any note, press the key above it. For example, press \"c\" for 3 notes, then the key right above it which is \"d\" to extend the 3rd note. Easy? 1st and 7th note extenders are an exception, see previous tip.",
        "settings": "Settings",
        "black": "Black",
        "gray": "Gray",
        "maroon": "Maroon",
        "red": "Red",
        "navy": "Navy",
        "blue": "Blue",
        "size": "Size",
        "sample": "Sample",
        "sampleEnglish": "<font class=\"EnglishFont\">Re</font><font class=\"HazzatFont\">x x </font><font class=\"EnglishFont\">jo</font><font class=\"HazzatFont\">xx v.x x </font><font class=\"EnglishFont\">ice O</font><font class=\"HazzatFont\">x </font><font class=\"EnglishFont\">&nbsp;Ma</font><font class=\"HazzatFont\">x </font><font class=\"EnglishFont\">ry</font><font class=\"HazzatFont\">xx...</font>",
        "sampleCoptic": "<font class=\"CopticFont\">Ou</font><font class=\"HazzatFont\">z</font><font class=\"CopticFont\">no</font><font class=\"HazzatFont\">x </font><font class=\"CopticFont\">f `</font><font class=\"HazzatFont\">x</font><font class=\"CopticFont\">mmo</font><font class=\"HazzatFont\">xx.v.x x x </font><font class=\"CopticFont\">&nbsp;Ma</font><font class=\"HazzatFont\">x</font><font class=\"CopticFont\">ri</font><font class=\"HazzatFont\">xx...</font>",
        "sampleArabic": "<span class=\"ArabicFont\">إ</span><span class=\"HazzatAFont\">ن </span><span class=\"ArabicFont\">فرَ</span><span class=\"HazzatAFont\">ن </span><span class=\"ArabicFont\">حي</span><span class=\"HazzatAFont\">نن ازن ن </span><span class=\"ArabicFont\">&nbsp;يا</span><span class=\"HazzatAFont\">ن </span><span class=\"ArabicFont\">&nbsp;مَـ</span><span class=\"HazzatAFont\">ن </span><span class=\"ArabicFont\">ريَـ</span><span class=\"HazzatAFont\">ننز...</span>"
    },
    ar: {
        "noContent": "الصفحة التي تبحث عنها غير موجودة. يرجى التحقق من العنوان ثم حاول مرة أخرى.",
        "switchLang": "English",
        "home": "الرئيسية",
        "seasons": "مواسم",
        "types": "أنواع",
        "tunes": "أنغام",
        "booklets": "كتيبات",
        "fonts": "الخطوط",
        "help": "مساعدة",
        "contactUs": "الإتصال بنا",
        "otherServices": "خدمات أُخرى",
        "loading": "جار التحميل...",
        "noSeasons": "لا توجد مواسم للعرض",
        "noTypes": "لا توجد أنواع للعرض",
        "noTunes": "لا توجد أنغام للعرض",
        "noBooklets": "لا توجد كتيبات للعرض",
        "followUs": "تابعنا",
        "menu": "القائمة",
        "seasonTitle": "الحان {0}",
        "textFormatName": "نَص",
        "hazzatFormatName": "هزّات",
        "verticalHazzatFormatName": "هزّات أفقية",
        "musicFormatName": "نوتة موسيقية",
        "audioFormatName": "مَلفّ صوتي",
        "videoFormatName": "فيديو",
        "informationFormatName": "معلومات",
        "contentNotFoundMessage": "المحتوى الذي تبحث عنه غير موجود...",
        "goBack": "رجوع",
        "musicalNotesLinkSuffix": "نوتة موسيقية",
        "musicAudioLinkSuffix": "صوت آلي",
        "audioLinkSuffix": "مَلفّ صوتي",
        "numeric0": "٠",
        "numeric1": "١",
        "numeric2": "٢",
        "numeric3": "٣",
        "numeric4": "٤",
        "numeric5": "٥",
        "numeric6": "٦",
        "numeric7": "٧",
        "numeric8": "٨",
        "numeric9": "٩",
        "forPrinting": "للطباعة",
        "forPrintingDesc": "الصفحات مرتبة على شكل كتيب. ستكون ترتيب الصفحات صحيحًا بمجرد تجميعها ككتيب.",
        "forDevices": "للأجهزة",
        "forDevicesDesc": "الصفحات مرتبة بترتيب متتالٍ للأجهزة الحساسة للمس.",
        "hazzatFont": "خط هزّات",
        "hazzatFontVer": "خط هزّات v1.10a",
        "hazzatFontDesc": "هذه الخطوط متاحة مجاناً للمشاركة بين الأقباط وغير الأقباط في جميع أنحاء العالم. نسألكم فقط طلباً واحداً من المؤلف... يرجى مشاركة ألحانكم مع الجميع لغرض التعليم. شكراً لكم، وجزاكم الله خيراً.",
        "copticFonts": "خطوط قبطية",
        "copticZipTitle": "ملف مضغوط يحتوي على خطوط قبطية التالية:",
        "copticZipContents": "Antonious 1<br />Athanasius<br />Avva_Bishoy<br />Avva_Kyrillos<br />Avva_Marcos<br />Avva_Shenouda<br />AvvaMarkos<br />Bishop Tadros<br />Copt<br />Coptic<br />Coptic1<br />CopticII<br />Coptonew<br />CS Avva Shenouda<br />CS Copt<br />CS Coptic Manuscript<br />CS Copto Manuscript<br />CS Koptos Manuscript<br />CS New Athanasius<br />CS Pishoi<br />Faith Ornaments<br />Koptos<br />Kyrillos<br />MENA 1<br />New Athanasius<br />Nopher<br />Pishoi<br />Pope Shenouda III<br />Saint Marina<br />SaintAbraham<br />SaintGeorges<br />SPAchmim",
        "save": "تحميل",
        "downloadAllCopticFonts": "تحميل جميع الخطوط القبطية",
        "hazzatFontReason": "تم إنشاء هذا الفونت لتسهيل تعلم الألحان القبطية الطويلة. فكرة الخط هي وضع علامات معينة بين الحروف القبطية لتسهيل متابعة الألحان. علامات الهزات ليسة معقدة. ولذلك، فإن شخصًا لا يعرف اللحن لا يمكنه ترديده فقط من خلال قراءة العلامات، ولكن يجب أن يستمع إلى اللحن وأن يتعرف على النغمة، وسيوجهه خط الهزات خلال نقاط الانتقال في اللحن.<br /><br />خط الـهزات ليس فكرة جديدة، ولكنه تم استخدامه في الكنيسة القبطية (بشكل رئيسي من قبل الشمامسة) لفترة طويلة. ومع ذلك، هذه هي المرة الأولى التي يتم إنشاء خط فونت له. الفكرة هي جعل ما يلي ممكنًا:",
        "hazzatAdvantagesList": "<li>تخزين جميع الألحان على كمبيوتر بدلاً من الأوراق المبعثرة في كل مكان.</li><li>القدرة على مشاركة هذه الألحان مع الاخرين.</li><li>نشر هذه الألحان على الإنترنت للتدريس.</li><li>جعلها تبدو جيدة وموحدة.</li><li>وضع مقياس للخطوط الأخرى لنفس الغرد.</li>",
        "hazzatDescSummary": "هذا الفونت متاح <span style=\"color: red\">للجميع</span> مجانًا، ويمكن مشاركته بين الأقباط وغير الأقباط في جميع أنحاء العالم. طلب وحيد من صاحب الخط... <span style=\"color: red\">يرجى مشاركة الألحان مع الجميع</span> لأجل التعليم. شكرًا لك، والله يعوض تعبك.",
        "enlargePic": "انقر على الصورة لتكبيرها في نافذة جديدة.",
        "downloadHazzatFont": "تحميل خط هزّات v1.10a",
        "yourContactInfo": "معلومات الاتصال بك",
        "yourFeedback": "الرسالة",
        "nameFormLabel": "الاسم:",
        "emailFormLabel": "البريد الإلكتروني:",
        "subjectFormLabel": "عنوان:",
        "messageFormLabel": "رسالة:",
        "submitFormLabel": "ارسل رأيك",
        "nameRequiredErrorText": "مطلوب الاسم",
        "emailRequiredErrorText": "مطلوب البريد الإلكتروني",
        "emailInvalidErrorText": "البريد الإلكتروني غير صالح",
        "subjectRequiredErrorText": "مطلوب العنوان",
        "messageRequiredErrorText": "مطلوب الرسالة",
        "feedbackThankYouMessage": "شكرا لتواصلك معنا!",
        "feedbackGetBackMessage": "سوف نعاود الاتصال بك في أقرب وقت ممكن.",
        "feedbackSubmitAnotherMessage": "أرسل رسالة أخرى",
        "hazzatFontHelp": "مساعدة خط الهزات",
        "insallingFonts": "تحميل الخطوط",
        "instructionsForWinXP": "تعليمات لنظام Windows XP",
        "instructionsForWin7": "تعليمات لنظام Windows 7",
        "usingTheFonts": "استعمال الخطوط",
        "usingTheHazzatFont": "استعمال خط الهزات",
        "usingTheVerticalHazzatFont": "استعمال خط الهزات الأفقية",
        "hazzatKeybdMap": "خريطة لوحة المفاتيح خط الهزات",
        "smallLetters": "الحروف الصغيرة",
        "capitalLetters": "الحروف الكبيرة",
        "keyboardMap": "خريطة لوحة المفاتيح",
        "downloadAndSaveZip": "قم بتنزيل الملف المضغوط وانقر على حفظ.",
        "extractZip": "قم باستخراج الملف المضغوط إلى سطح المكتب",
        "ctrPanelFonts": "انقر مرتين على لوحة التحكم > الخطوط",
        "fileInstallFont": "انقر على \"ملف\" > \"تثبيت خط جديد\".",
        "browseAndOK": "تصفح إلى سطح المكتب الخاص بك حيث قمت باستخراج خط الهزات ، وحدده ، وانقر على OK.",
        "browseAndSelect": "تصفح المجلد الذي يحتوي على ملفات الخطوط المستخرجة وحدد كل الخطوط",
        "clickAndInstall": "انقر بزر الماوس الأيمن على الخطوط واختر \"تثبيت\"",
        "topics": "موضوعات",
        "aboutHelp": "حول صفحة المساعدة هذه",
        "aboutHazzat": "حول خط الهزت",
        "keyMappings": "تعيينات المفاتيح",
        "usage": "إستعمال",
        "regularNotes": "التدوينات العادية",
        "shortNotes": "التدوينات القصيرة",
        "highNotes": "تدوينات عالية",
        "regularExtend": "استمداد التدوينات العادية",
        "vibratedNotes": "التدوينات المهتزة",
        "specialChars": "تدوينات خاصة",
        "abrupt": "للانتقال بسرعة إلى التدوينات التالية",
        "fastChant": "لتدوين جزء ليتم ترديده بسرعة",
        "breathMark": "علامة التنفس أو وقفة / استراحة",
        "lowerOrHigher": "لتدوين نغمات أقل أو أعلى",
        "repeatMark": "للتكرار",
        "markingChars": "لتمييز جزء معين",
        "exampleHymn": "مثال للحن",
        "helpfulTip": "تلميح مفيد",
        "aboutHelpContent": "تمت كتابة ملف التعليمات هذا لتعريف المستخدم بالخط ، ولماذا تم تعيين تعيينات المفاتيح بهذه الطريقة. برجاء قراءة ملف التعليمات كاملاً قبل استخدام الخط. ستجعل قراءة الوثائق الخاصة بخط الهزات الأمر أسهل للمستخدم ، وأسرع عند كتابة التراتيل.",
        "key": "مفتاح",
        "symbol": "رمز",
        "description": "الوصف",
        "oneNote": "تدوين واحد",
        "twoNotes": "اثنين من التدوينات",
        "threeNotes": "ثلاثة من التدوينات",
        "fourNotes": "أربعة من التدوينات",
        "fiveNotes": "خمسة من التدوينات",
        "sixNotes": "ستة من التدوينات",
        "sevenNotes": "سبعة من التدوينات",
        "oneShortNote": "تدوين واحد",
        "twoShortNotes": "اثنين من التدوينات القصيرة",
        "threeShortNotes": "ثلاثة من التدوينات القصيرة",
        "fourShortNotes": "أربعة من التدوينات القصيرة",
        "fiveShortNotes": "خمسة من التدوينات القصيرة",
        "sixShortNotes": "ستة من التدوينات القصيرة",
        "sevenShortNotes": "سبعة من التدوينات القصيرة",
        "firstExtender": "استمداد التدوين الاول",
        "secondExtender": "استمداد التدوين الثاني",
        "thirdExtender": "استمداد التدوين الثالث",
        "fourthExtender": "استمداد التدوين الرابع",
        "fifthExtender": "استمداد التدوين الخامس",
        "sixthExtender": "استمداد التدوين السادس",
        "seventhExtender": "استمداد التدوين السابع",
        "oneHighNote": "تدوين واحد عالي",
        "twoHighNotes": "اثنين من التدوينات عالي",
        "threeHighNotes": "ثلاثة من التدوينات عالي",
        "fourHighNotes": "أربعة من التدوينات عالي",
        "fiveHighNotes": "خمسة من التدوينات عالي",
        "sixHighNotes": "ستة من التدوينات عالي",
        "secondVibrated": "اهتزاز التدوين الثاني (في مكانه بعد الحرف)",
        "thirdVibrated": "اهتزاز التدوين الثالث (في مكانه بعد الحرف)",
        "fourthVibrated": "اهتزاز التدوين الرابع (في مكانه بعد الحرف)",
        "fifthVibrated": "اهتزاز التدوين الخامس (في مكانه بعد الحرف)",
        "sixthVibrated": "اهتزاز التدوين السادس (في مكانه بعد الحرف)",
        "abruptNote": "تغيير بسرعة إلى الحرف التالي",
        "fastUnderscore": "ترديد سريع تسطير أسفل السطر (في مكان بعد الحرف)",
        "fastArrow": "ترديد سريع رأس السهم (في مكان بعد الحرف)",
        "pauseMark": "علامة التوقف / التنفس",
        "higherTone": "نغمة أعلى",
        "lowerTone": "نغمة أقل",
        "repeatOne": "كرر مرة واحدة",
        "repeatTwo": "كرر مرتين",
        "repeatThree": "كرر ثلاث مرات",
        "repeatFour": "كرر أربع مرات",
        "repeatFive": "كرر خمس مرات",
        "repeatSix": "كرر ست مرات",
        "repeatSeven": "كرر سبع مرات",
        "repeatEight": "كرر ثمانية مرة",
        "repeatNine": "كرر تسع مرات",
        "zeroNote": "صفر",
        "markOne": "علامة رقم واحد",
        "markTwo": "علامة رقم اثنين",
        "markThree": "علامة رقم ثلاثة",
        "markFour": "علامة رقم أربعة",
        "markFive": "علامة رقم خمسة",
        "markSix": "علامة رقم ستة",
        "markSeven": "علامة رقم سبعة",
        "regularDesc1": "يمكن الحصول على ما يصل إلى سبع نوتات متتالية بالضغط على:",
        "for": "لـ",
        "helpTip": "نصيحة",
        "regularTip": "انظر إلى لوحة المفاتيح الخاصة بك وحدد موقع الحرف \"z\". هذا هو مفتاح النوتة الواحدة. بجوارها مباشرة توجد \"x\" وهذه إثنان. ثم \"c\" لـ 3 ، و \"v\" لـ 4 ، و \"b\" لـ 5 ، و \"n\" لـ 6 ، وأخيراً \"m\" لـ 7 ملاحظات. فهمت الصورة؟",
        "regularDesc2": "يمكنك أيضًا دمج نوتتين متشابهتين بجانب بعضهما البعض لجعلهما أطول. إليك 3 نوتات طويلة على سبيل المثال:",
        "threeLongNotes": "ثلاث نوتات طويلة",
        "regularDesc3": "أو يمكنك الجمع بين نوتتين عاديتين مختلفتين للحصول على تطويل نوتة معينة ، مثل:",
        "twoLongOneReg": "2 نوتة طويلة ثم نوتة عادية",
        "oneLongThreeReg": "1 نوتة طويلة ثم 3 نوتة عادية",
        "shortDesc1": "أيضًا ، هناك ما يصل إلى سبع نوتات قصيرة متتالية يمكن الحصول عليها بالضغط على:",
        "shortTip": "تتشابه مواقع النوتات القصيرة السبعة مع النوتات العادية ، لكنها تقع في الصف العلوي. تبدأ النوتات من \"q\" لنوتة قصيرة واحدة ، وتنتهي بـ \"u\" لـ 7 نوتات قصيرة.",
        "highDesc1": "هناك ما يصل إلى سبع نوتات عالية متتالية يمكن الحصول عليها بالضغط على:",
        "highTip": "لاحظ أنه يمكن الحصول على النوتات العالية باستخدام مفتاح Shift بالإضافة إلى المفتاح المعتاد للنوتات العادية. بالنسبة للنغمة السابعة العالية ، يمكنك استخدام نفس المفتاح مثل الرقم 7 العادي لأن سبع ملاحظات هي الحد الأقصى لعدد النوتات المتتالية التي يمكن أن تحصل عليها. لذلك يمكنك استخدام الحرف الصغير \"m\" لذلك.",
        "highDesc2": "مرة أخرى ، نفس الفكرة مع النوتات العادية ، يمكنك دمج نوتاتين متتاليتين للحصول على تطويل نوتة معينة ، على سبيل المثال:",
        "extendDesc1": "تستخدم الاستمدادات لتطويل أي نوتة معينة.",
        "extendTip1": "بالنسبة لاستمداد النوتة الأولة ، استخدم نفس مفتاح نوتة واحدة \"z\". أما بالنسبة لاستمداد النوتة السابعة ، فاستخدم الحرف \"Z\" وهو المفتاح للحصول على نوتة واحدة عالية.",
        "extendTip2": "لاستمداد أي نوتة ، اضغط على المفتاح أعلاه. على سبيل المثال ، اضغط على \"c\" لثلاث نوتات ، ثم اضغط على المفتاح الموجود فوقها مباشرة وهو \"d\" لاستمداد النوتة الثالثة. سهل؟ استمداد النوتة الأولى والسابعة استثناء ، انظر النصيحة السابقة.",
        "settings": "إعدادات",
        "black": "أسود",
        "gray": "رمادي",
        "maroon": "أحمر داكن",
        "red": "أحمر",
        "navy": "أزرق داكن",
        "blue": "أزرق",
        "size": "حجم",
        "sample": "نموذج",
        "sampleEnglish": "<font class=\"EnglishFont\">Re</font><font class=\"HazzatFont\">x x </font><font class=\"EnglishFont\">jo</font><font class=\"HazzatFont\">xx v.x x </font><font class=\"EnglishFont\">ice O</font><font class=\"HazzatFont\">x </font><font class=\"EnglishFont\">&nbsp;Ma</font><font class=\"HazzatFont\">x </font><font class=\"EnglishFont\">ry</font><font class=\"HazzatFont\">xx...</font>",
        "sampleCoptic": "<font class=\"CopticFont\">Ou</font><font class=\"HazzatFont\">z</font><font class=\"CopticFont\">no</font><font class=\"HazzatFont\">x </font><font class=\"CopticFont\">f `</font><font class=\"HazzatFont\">x</font><font class=\"CopticFont\">mmo</font><font class=\"HazzatFont\">xx.v.x x x </font><font class=\"CopticFont\">&nbsp;Ma</font><font class=\"HazzatFont\">x</font><font class=\"CopticFont\">ri</font><font class=\"HazzatFont\">xx...</font>",
        "sampleArabic": "<span class=\"ArabicFont\">إ</span><span class=\"HazzatAFont\">ن </span><span class=\"ArabicFont\">فرَ</span><span class=\"HazzatAFont\">ن </span><span class=\"ArabicFont\">حي</span><span class=\"HazzatAFont\">نن ازن ن </span><span class=\"ArabicFont\">&nbsp;يا</span><span class=\"HazzatAFont\">ن </span><span class=\"ArabicFont\">&nbsp;مَـ</span><span class=\"HazzatAFont\">ن </span><span class=\"ArabicFont\">ريَـ</span><span class=\"HazzatAFont\">ننز...</span>"
    }
});
