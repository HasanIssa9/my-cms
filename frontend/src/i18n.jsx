import { createContext, useContext, useState, useEffect } from 'react';

export const LANGS = { ar: 'ar', en: 'en' };

const T = {
  ar: {
    dir: 'rtl',
    lang: 'العربية',
    langSwitch: 'English',
    nav: {
      dashboard: 'الرئيسية',
      posts: 'المقالات',
      pages: 'الصفحات',
      media: 'الوسائط',
      settings: 'الإعدادات',
      viewSite: 'عرض الموقع',
      logout: 'تسجيل الخروج',
    },
    login: {
      welcome: 'مرحباً بعودتك',
      sub: 'سجّل دخولك للوحة التحكم',
      username: 'اسم المستخدم',
      password: 'كلمة المرور',
      submit: 'تسجيل الدخول',
      loading: 'جاري الدخول…',
      error: 'اسم المستخدم أو كلمة المرور غير صحيحة',
      hint: 'admin / admin123',
    },
    dashboard: {
      title: 'الرئيسية',
      sub: 'نظرة عامة على موقعك',
      posts: 'المقالات',
      published: 'منشور',
      pages: 'الصفحات',
      media: 'الوسائط',
      of: 'من',
      recent: 'آخر المحتوى',
      empty: 'لا يوجد محتوى بعد',
      actions: 'إجراءات سريعة',
      newPost: 'مقال جديد',
      newPage: 'صفحة جديدة',
      uploadMedia: 'رفع وسائط',
      goSettings: 'الإعدادات',
      post: 'مقال',
      page: 'صفحة',
    },
    posts: {
      posts: 'المقالات',
      pages: 'الصفحات',
      post: 'مقال',
      page: 'صفحة',
      total: 'إجمالي',
      newPost: 'مقال جديد',
      newPage: 'صفحة جديدة',
      search: 'بحث…',
      allStatus: 'جميع الحالات',
      published: 'منشور',
      draft: 'مسودة',
      title: 'العنوان',
      status: 'الحالة',
      updated: 'آخر تعديل',
      edit: 'تعديل',
      delete: 'حذف',
      noResults: 'لا توجد نتائج',
      noContent: 'لا يوجد محتوى بعد',
      createFirst: 'أنشئ أول',
      confirmDelete: 'هل تريد حذف',
    },
    media: {
      title: 'الوسائط',
      upload: '+ رفع ملفات',
      uploading: 'جاري الرفع…',
      search: 'بحث في الملفات…',
      noFiles: 'لا توجد ملفات بعد',
      noResults: 'لا توجد نتائج',
      selectFile: 'اختر ملفاً لعرض التفاصيل',
      details: 'تفاصيل الملف',
      name: 'الاسم',
      type: 'النوع',
      size: 'الحجم',
      uploaded: 'رُفع في',
      copyUrl: 'نسخ الرابط',
      copied: '✓ تم النسخ',
      openFile: 'فتح الملف ↗',
      deleteFile: 'حذف',
      confirmDelete: 'حذف',
    },
    settings: {
      title: 'الإعدادات',
      sub: 'إعدادات الموقع العامة',
      identity: 'هوية الموقع',
      identitySub: 'المعلومات الأساسية للموقع',
      siteTitle: 'اسم الموقع',
      tagline: 'وصف قصير',
      email: 'البريد الإلكتروني',
      appearance: 'المظهر',
      appearanceSub: 'اختر الشكل العام للموقع',
      theme: 'القالب',
      themeDefault: 'الافتراضي (أزرق)',
      themeDark: 'داكن',
      themeMinimal: 'بسيط (نصي)',
      reading: 'القراءة',
      postsPerPage: 'عدد المقالات في الصفحة',
      save: 'حفظ الإعدادات',
      saving: 'جاري الحفظ…',
      saved: '✓ تم الحفظ',
      password: 'تغيير كلمة المرور',
      currentPw: 'كلمة المرور الحالية',
      newPw: 'كلمة المرور الجديدة',
      confirmPw: 'تأكيد كلمة المرور',
      updatePw: 'تحديث كلمة المرور',
      updatingPw: 'جاري التحديث…',
      pwMismatch: 'كلمتا المرور غير متطابقتين',
      pwTooShort: 'يجب أن تكون كلمة المرور 6 أحرف على الأقل',
      pwWrong: 'كلمة المرور الحالية غير صحيحة',
      pwSaved: '✓ تم تغيير كلمة المرور',
      errorSave: 'حدث خطأ أثناء الحفظ',
      themePreview: ['الافتراضي', 'داكن', 'بسيط'],
    },
    status: { published: 'منشور', draft: 'مسودة' },
  },

  en: {
    dir: 'ltr',
    lang: 'English',
    langSwitch: 'العربية',
    nav: {
      dashboard: 'Dashboard',
      posts: 'Posts',
      pages: 'Pages',
      media: 'Media',
      settings: 'Settings',
      viewSite: 'View Site',
      logout: 'Log Out',
    },
    login: {
      welcome: 'Welcome back',
      sub: 'Sign in to your admin panel',
      username: 'Username',
      password: 'Password',
      submit: 'Sign In',
      loading: 'Signing in…',
      error: 'Invalid username or password',
      hint: 'admin / admin123',
    },
    dashboard: {
      title: 'Dashboard',
      sub: 'Overview of your site',
      posts: 'Posts',
      published: 'Published',
      pages: 'Pages',
      media: 'Media',
      of: 'of',
      recent: 'Recent Content',
      empty: 'No content yet',
      actions: 'Quick Actions',
      newPost: 'New Post',
      newPage: 'New Page',
      uploadMedia: 'Upload Media',
      goSettings: 'Settings',
      post: 'Post',
      page: 'Page',
    },
    posts: {
      posts: 'Posts',
      pages: 'Pages',
      post: 'Post',
      page: 'Page',
      total: 'total',
      newPost: 'New Post',
      newPage: 'New Page',
      search: 'Search…',
      allStatus: 'All statuses',
      published: 'Published',
      draft: 'Draft',
      title: 'Title',
      status: 'Status',
      updated: 'Updated',
      edit: 'Edit',
      delete: 'Delete',
      noResults: 'No results found',
      noContent: 'No content yet',
      createFirst: 'Create your first',
      confirmDelete: 'Delete',
    },
    media: {
      title: 'Media',
      upload: '+ Upload Files',
      uploading: 'Uploading…',
      search: 'Search files…',
      noFiles: 'No files uploaded yet',
      noResults: 'No results found',
      selectFile: 'Select a file to see details',
      details: 'File Details',
      name: 'Name',
      type: 'Type',
      size: 'Size',
      uploaded: 'Uploaded',
      copyUrl: 'Copy URL',
      copied: '✓ Copied',
      openFile: 'Open File ↗',
      deleteFile: 'Delete',
      confirmDelete: 'Delete',
    },
    settings: {
      title: 'Settings',
      sub: 'Manage your site configuration',
      identity: 'Site Identity',
      identitySub: 'Basic information about your site',
      siteTitle: 'Site Title',
      tagline: 'Tagline',
      email: 'Admin Email',
      appearance: 'Appearance',
      appearanceSub: 'Choose the look of your site',
      theme: 'Theme',
      themeDefault: 'Default (Blue)',
      themeDark: 'Dark',
      themeMinimal: 'Minimal (Typography)',
      reading: 'Reading',
      postsPerPage: 'Posts per page',
      save: 'Save Settings',
      saving: 'Saving…',
      saved: '✓ Saved',
      password: 'Change Password',
      currentPw: 'Current Password',
      newPw: 'New Password',
      confirmPw: 'Confirm New Password',
      updatePw: 'Update Password',
      updatingPw: 'Updating…',
      pwMismatch: 'Passwords do not match',
      pwTooShort: 'Password must be at least 6 characters',
      pwWrong: 'Current password is incorrect',
      pwSaved: '✓ Password changed successfully',
      errorSave: 'Error saving settings',
      themePreview: ['Default', 'Dark', 'Minimal'],
    },
    status: { published: 'Published', draft: 'Draft' },
  },
};

const LangCtx = createContext(null);

export function LangProvider({ children }) {
  const [lang, setLangState] = useState(() => localStorage.getItem('cms_lang') || 'ar');
  const [dark, setDarkState] = useState(() => localStorage.getItem('cms_dark') === '1');

  function setLang(l) {
    setLangState(l);
    localStorage.setItem('cms_lang', l);
  }

  function toggleDark() {
    setDarkState(d => {
      const next = !d;
      localStorage.setItem('cms_dark', next ? '1' : '0');
      return next;
    });
  }

  useEffect(() => {
    document.documentElement.dir = T[lang].dir;
    document.documentElement.lang = lang;
  }, [lang]);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', dark);
  }, [dark]);

  return (
    <LangCtx.Provider value={{ lang, setLang, t: T[lang], dark, toggleDark }}>
      {children}
    </LangCtx.Provider>
  );
}

export function useLang() {
  return useContext(LangCtx);
}
