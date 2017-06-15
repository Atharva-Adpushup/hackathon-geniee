const languageSupport = ['en', 'en_US', 'ja', 'ja_JP', 'vi', 'vi_VN'];
// Language codes actively supported in product localisation at the moment
const languageCodeSupport = ['en', 'ja'];
const languageMapping = {
    en: ['en', 'en_US'],
    ja: ['ja', 'ja_JP'],
    vi: ['vi', 'vi_VN']
};
const defaultLanguageCode = 'en';

module.exports = { languageSupport, languageMapping, languageCodeSupport, defaultLanguageCode };
