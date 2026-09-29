import React, { createContext, useContext, useState, useEffect } from 'react';

export interface LanguageInfo {
  code: string;
  name: string;
  nativeName: string;
  flag: string;
  region: 'MENA & Africa' | 'Europe' | 'Asia & Pacific' | 'Americas';
  isRtl?: boolean;
  moroccan?: boolean;
  popular?: boolean;
}

export const ALL_LANGUAGES: LanguageInfo[] = [
  // 1. Moroccan Languages (Prominently featured)
  {
    code: 'ary',
    name: 'Moroccan Darija (Maroc)',
    nativeName: 'الدارجة المغربية',
    flag: '🇲🇦',
    region: 'MENA & Africa',
    isRtl: true,
    moroccan: true,
    popular: true,
  },
  {
    code: 'zgh',
    name: 'Tamazight (Berber Maroc)',
    nativeName: 'ⵜⴰⵎⴰⵣⵉⵖⵜ (المغرب)',
    flag: '🇲🇦',
    region: 'MENA & Africa',
    moroccan: true,
    popular: true,
  },

  // 2. Global & Popular Languages
  {
    code: 'es',
    name: 'Español (Spanish)',
    nativeName: 'Español',
    flag: '🇪🇸',
    region: 'Europe',
    popular: true,
  },
  {
    code: 'en',
    name: 'English (US/UK)',
    nativeName: 'English',
    flag: '🇺🇸',
    region: 'Americas',
    popular: true,
  },
  {
    code: 'fr',
    name: 'Français (France/Maroc)',
    nativeName: 'Français',
    flag: '🇫🇷',
    region: 'Europe',
    popular: true,
  },
  {
    code: 'ar',
    name: 'Arabic (العربية الفصحى)',
    nativeName: 'العربية',
    flag: '🇸🇦',
    region: 'MENA & Africa',
    isRtl: true,
    popular: true,
  },
  {
    code: 'de',
    name: 'Deutsch (German)',
    nativeName: 'Deutsch',
    flag: '🇩🇪',
    region: 'Europe',
    popular: true,
  },
  {
    code: 'it',
    name: 'Italiano (Italian)',
    nativeName: 'Italiano',
    flag: '🇮🇹',
    region: 'Europe',
    popular: true,
  },
  {
    code: 'pt',
    name: 'Português (Portuguese)',
    nativeName: 'Português',
    flag: '🇵🇹',
    region: 'Europe',
    popular: true,
  },
  {
    code: 'nl',
    name: 'Nederlands (Dutch)',
    nativeName: 'Nederlands',
    flag: '🇳🇱',
    region: 'Europe',
  },
  {
    code: 'ru',
    name: 'Russian (Русский)',
    nativeName: 'Русский',
    flag: '🇷🇺',
    region: 'Europe',
    popular: true,
  },
  {
    code: 'tr',
    name: 'Türkçe (Turkish)',
    nativeName: 'Türkçe',
    flag: '🇹🇷',
    region: 'MENA & Africa',
    popular: true,
  },
  {
    code: 'zh-CN',
    name: 'Chinese Simplified (简体中文)',
    nativeName: '简体中文',
    flag: '🇨🇳',
    region: 'Asia & Pacific',
    popular: true,
  },
  {
    code: 'zh-TW',
    name: 'Chinese Traditional (繁體中文)',
    nativeName: '繁體中文',
    flag: '🇹🇼',
    region: 'Asia & Pacific',
  },
  {
    code: 'ja',
    name: 'Japanese (日本語)',
    nativeName: '日本語',
    flag: '🇯🇵',
    region: 'Asia & Pacific',
    popular: true,
  },
  {
    code: 'ko',
    name: 'Korean (한국어)',
    nativeName: '한국어',
    flag: '🇰🇷',
    region: 'Asia & Pacific',
    popular: true,
  },
  {
    code: 'hi',
    name: 'Hindi (हिन्दी)',
    nativeName: 'हिन्दी',
    flag: '🇮🇳',
    region: 'Asia & Pacific',
    popular: true,
  },
  {
    code: 'bn',
    name: 'Bengali (বাংলা)',
    nativeName: 'বাংলা',
    flag: '🇧🇩',
    region: 'Asia & Pacific',
  },
  {
    code: 'ur',
    name: 'Urdu (اردو)',
    nativeName: 'اردو',
    flag: '🇵🇰',
    region: 'Asia & Pacific',
    isRtl: true,
  },
  {
    code: 'fa',
    name: 'Persian (فارسی)',
    nativeName: 'فارسی',
    flag: '🇮🇷',
    region: 'MENA & Africa',
    isRtl: true,
  },
  {
    code: 'pl',
    name: 'Polski (Polish)',
    nativeName: 'Polski',
    flag: '🇵🇱',
    region: 'Europe',
  },
  {
    code: 'sv',
    name: 'Svenska (Swedish)',
    nativeName: 'Svenska',
    flag: '🇸🇪',
    region: 'Europe',
  },
  {
    code: 'no',
    name: 'Norsk (Norwegian)',
    nativeName: 'Norsk',
    flag: '🇳🇴',
    region: 'Europe',
  },
  {
    code: 'da',
    name: 'Dansk (Danish)',
    nativeName: 'Dansk',
    flag: '🇩🇰',
    region: 'Europe',
  },
  {
    code: 'fi',
    name: 'Suomi (Finnish)',
    nativeName: 'Suomi',
    flag: '🇫🇮',
    region: 'Europe',
  },
  {
    code: 'el',
    name: 'Greek (Ελληνικά)',
    nativeName: 'Ελληνικά',
    flag: '🇬🇷',
    region: 'Europe',
  },
  {
    code: 'ro',
    name: 'Română (Romanian)',
    nativeName: 'Română',
    flag: '🇷🇴',
    region: 'Europe',
  },
  {
    code: 'uk',
    name: 'Ukrainian (Українська)',
    nativeName: 'Українська',
    flag: '🇺🇦',
    region: 'Europe',
  },
  {
    code: 'cs',
    name: 'Czech (Čeština)',
    nativeName: 'Čeština',
    flag: '🇨🇿',
    region: 'Europe',
  },
  {
    code: 'hu',
    name: 'Magyar (Hungarian)',
    nativeName: 'Magyar',
    flag: '🇭🇺',
    region: 'Europe',
  },
  {
    code: 'id',
    name: 'Bahasa Indonesia (Indonesian)',
    nativeName: 'Bahasa Indonesia',
    flag: '🇮🇩',
    region: 'Asia & Pacific',
  },
  {
    code: 'ms',
    name: 'Bahasa Melayu (Malay)',
    nativeName: 'Bahasa Melayu',
    flag: '🇲🇾',
    region: 'Asia & Pacific',
  },
  {
    code: 'vi',
    name: 'Tiếng Việt (Vietnamese)',
    nativeName: 'Tiếng Việt',
    flag: '🇻🇳',
    region: 'Asia & Pacific',
  },
  {
    code: 'th',
    name: 'Thai (ไทย)',
    nativeName: 'ไทย',
    flag: '🇹🇭',
    region: 'Asia & Pacific',
  },
  {
    code: 'he',
    name: 'Hebrew (עברית)',
    nativeName: 'עברית',
    flag: '🇮🇱',
    region: 'MENA & Africa',
    isRtl: true,
  },
  {
    code: 'sw',
    name: 'Kiswahili (Swahili)',
    nativeName: 'Kiswahili',
    flag: '🇰🇪',
    region: 'MENA & Africa',
  },
  {
    code: 'tl',
    name: 'Tagalog (Filipino)',
    nativeName: 'Tagalog',
    flag: '🇵🇭',
    region: 'Asia & Pacific',
  },
  {
    code: 'ca',
    name: 'Català (Catalan)',
    nativeName: 'Català',
    flag: '🇪🇸',
    region: 'Europe',
  },
  {
    code: 'hr',
    name: 'Hrvatski (Croatian)',
    nativeName: 'Hrvatski',
    flag: '🇭🇷',
    region: 'Europe',
  },
  {
    code: 'sk',
    name: 'Slovenčina (Slovak)',
    nativeName: 'Slovenčina',
    flag: '🇸🇰',
    region: 'Europe',
  },
  {
    code: 'bg',
    name: 'Bulgarian (Български)',
    nativeName: 'Български',
    flag: '🇧🇬',
    region: 'Europe',
  },
  {
    code: 'sr',
    name: 'Serbian (Српски)',
    nativeName: 'Српски',
    flag: '🇷🇸',
    region: 'Europe',
  },
];

// Rich translations dictionary
export const TRANSLATIONS: Record<string, Record<string, string>> = {
  // 🇪🇸 Spanish (Español) - Comprehensive Complete Translation
  es: {
    // Navigation
    'nav.home': 'Inicio',
    'nav.chat': 'Chat y Mensajes',
    'nav.teams': 'Equipos',
    'nav.friends': 'Amigos',
    'nav.tasks': 'Tareas',
    'nav.announcements': 'Anuncios',
    'nav.work': 'Trabajo y Proyectos',
    'nav.notifications': 'Notificaciones',
    'nav.settings': 'Configuración',
    'nav.moderator_panel': 'Consola de Moderador',
    'nav.admin_panel': 'Consola de Administración',
    'nav.owner_panel': 'Consola de Propietario (Root)',
    'nav.logout': 'Cerrar Sesión',
    'nav.main_workspace': 'Espacio Principal',
    'nav.management': 'Gestión y Controles',

    // Header & Global
    'header.workspace': 'Espacio de Trabajo',
    'header.search_placeholder': 'Buscar en el espacio...',
    'header.search_shortcut': '⌘K',
    'header.notifications': 'Notificaciones',
    'header.language': 'Idioma',
    'header.choose_language': 'Elegir Idioma',

    // Home View
    'home.welcome_back': 'Bienvenido de nuevo,',
    'home.hero_title': 'Trabajen juntos. Manténganse organizados. Logren resultados.',
    'home.hero_desc': 'Regresa a los canales de tu equipo, haz seguimiento de tus tareas y colabora en proyectos con tus compañeros.',
    'home.open_chat': 'Abrir Chat Directo',
    'home.browse_work': 'Explorar Estudio WORK',
    'home.chat_subtitle': 'Mensajes Directos',
    'home.teams_subtitle': 'Espacios colaborativos',
    'home.tasks_subtitle': 'pendientes',
    'home.announce_subtitle': 'Difusión de la empresa',
    'home.work_subtitle': '15 Categorías PC',
    'home.billing_subtitle': 'Pago Seguro Stripe',
    'home.recent_deliverables': 'Entregables de WORK en curso',
    'home.view_all': 'Ver Todo',
    'home.files': 'archivos',
    'home.latest_announcement': 'Último Anuncio',
    'home.no_announcements': 'No hay anuncios publicados aún.',
    'home.assigned_tasks': 'Tareas Asignadas',
    'home.tasks_open': 'abiertas',

    // Language Modal
    'lang.title': 'Elegir Idioma de la Interfaz',
    'lang.subtitle': 'Selecciona tu idioma preferido. Más de 40 idiomas disponibles incluyendo el árabe marroquí (Darija 🇲🇦).',
    'lang.search_placeholder': 'Buscar idioma por nombre o país (ej. Marruecos, Darija, Español, English)...',
    'lang.moroccan_badge': 'Marruecos 🇲🇦',
    'lang.moroccan_featured': 'Idiomas de Marruecos (Marruecos 🇲🇦)',
    'lang.all': 'Todos los Idiomas',
    'lang.featured': 'Populares y Destacados',
    'lang.mena': 'MENA y África 🇲🇦',
    'lang.europe': 'Europa',
    'lang.asia': 'Asia y Pacífico',
    'lang.current': 'Idioma Actualmente Activo',
    'lang.select_button': 'Aplicar Idioma',
    'lang.no_results': 'No se encontraron idiomas coincidentes con',

    // Settings
    'settings.title': 'Cuenta y Preferencias',
    'settings.subtitle': 'Administra tu perfil personal, credenciales de seguridad, idioma de la interfaz y suscripción de facturación.',
    'settings.tab_profile': 'Perfil',
    'settings.tab_security': 'Seguridad',
    'settings.tab_language': 'Idioma / Language',
    'settings.tab_billing': 'Facturación Stripe',
    'settings.lang_heading': 'Idioma de la Aplicación y Opciones Regionales',
    'settings.lang_desc': 'Personaliza tu experiencia de idioma en WorkChat con soporte completo para Darija marroquí 🇲🇦 y los principales idiomas del mundo.',
    'settings.current_active': 'Idioma activo actual',
    'settings.change_lang': 'Cambiar Idioma',
    'settings.save': 'Guardar Cambios',
    'settings.update_password': 'Actualizar Contraseña',
    'settings.new_password': 'Nueva Contraseña',
    'settings.confirm_password': 'Confirmar Nueva Contraseña',

    // Panel Security Code
    'panel_code.title_owner': 'Clave de Seguridad de la Consola de Propietario',
    'panel_code.title_admin': 'Clave de Seguridad de la Consola de Administración',
    'panel_code.title_moderator': 'Clave de Seguridad de la Consola de Moderador',
    'panel_code.desc_owner': 'Cambia el código de acceso maestro requerido para desbloquear la consola raíz de Propietario.',
    'panel_code.desc_admin': 'Cambia el código de acceso requerido para desbloquear la consola de administración.',
    'panel_code.desc_moderator': 'Cambia el código de acceso requerido para desbloquear la consola de moderación.',
    'panel_code.current_code': 'Código Activo Actual',
    'panel_code.new_code': 'Nuevo Código de Acceso de Seguridad',
    'panel_code.help_text': 'Cualquier persona que intente acceder a este panel deberá introducir este código en la ventana de verificación.',
    'panel_code.update_button': 'Actualizar Código de Seguridad',
    'panel_code.min_length': 'El nuevo código de seguridad debe tener al menos 3 caracteres.',
    'panel_code.success': '¡Código de acceso actualizado con éxito!',
    'panel_code.error': 'Error al actualizar el código de acceso.',

    // Common
    'common.copy': 'Copiar',
    'common.copied': '¡Copiado!',
    'common.refresh': 'Actualizar',
    'common.updating': 'Actualizando...',
    'common.save': 'Guardar',
    'common.cancel': 'Cancelar',
    'common.delete': 'Eliminar',
    'common.edit': 'Editar',

    // Landing & Auth
    'landing.login': 'Iniciar Sesión',
    'landing.register': 'Comenzar',
    'landing.instant_account': 'Cuenta Rápida de Invitado',
    'landing.how_it_works': 'Cómo Funciona',
  },

  // 🇺🇸 English (Default)
  en: {
    // Nav items
    'nav.home': 'Home',
    'nav.chat': 'Chat',
    'nav.teams': 'Teams',
    'nav.friends': 'Friends',
    'nav.tasks': 'Tasks',
    'nav.announcements': 'Announcements',
    'nav.work': 'WORK',
    'nav.notifications': 'Notifications',
    'nav.settings': 'Settings',
    'nav.moderator_panel': 'Moderator Console',
    'nav.admin_panel': 'Admin Console',
    'nav.owner_panel': 'Owner Console',
    'nav.logout': 'Sign Out',
    'nav.main_workspace': 'Main Workspace',
    'nav.management': 'Management & Controls',
    
    // Header & Global
    'header.workspace': 'Workspace',
    'header.search_placeholder': 'Search workspace...',
    'header.search_shortcut': '⌘K',
    'header.notifications': 'Notifications',
    'header.language': 'Language',
    'header.choose_language': 'Choose Language',

    // Home View
    'home.welcome_back': 'Welcome back,',
    'home.hero_title': 'Work together. Stay organized. Get things done.',
    'home.hero_desc': 'Jump back into your team channels, track ongoing tasks, or collaborate on your PC work projects with your teammates.',
    'home.open_chat': 'Open Direct Chat',
    'home.browse_work': 'Browse WORK Studio',
    'home.chat_subtitle': 'Direct Messages',
    'home.teams_subtitle': 'Collaborative spaces',
    'home.tasks_subtitle': 'pending',
    'home.announce_subtitle': 'Company broadcast',
    'home.work_subtitle': '15 PC Categories',
    'home.billing_subtitle': 'Stripe Checkout',
    'home.recent_deliverables': 'Ongoing WORK Deliverables',
    'home.view_all': 'View All',
    'home.files': 'files',
    'home.latest_announcement': 'Latest Announcement',
    'home.no_announcements': 'No announcements published yet.',
    'home.assigned_tasks': 'Assigned Tasks',
    'home.tasks_open': 'open',

    // Language modal
    'lang.title': 'Choose Interface Language',
    'lang.subtitle': 'Select your preferred language. Search across 40+ world languages including Moroccan Darija.',
    'lang.search_placeholder': 'Search language by name, native script, or country (e.g. Morocco, Darija, Français, العربية)...',
    'lang.moroccan_badge': 'Maroc / المغرب',
    'lang.moroccan_featured': 'Moroccan Languages (Maroc 🇲🇦)',
    'lang.all': 'All Languages',
    'lang.featured': 'Popular & Featured',
    'lang.mena': 'MENA & Africa 🇲🇦',
    'lang.europe': 'Europe',
    'lang.asia': 'Asia & Pacific',
    'lang.current': 'Active Language',
    'lang.select_button': 'Apply Language',
    'lang.no_results': 'No languages found matching',

    // Settings
    'settings.title': 'Account & Preferences',
    'settings.subtitle': 'Manage your personal profile, security credentials, interface language, and billing subscription.',
    'settings.tab_profile': 'Profile',
    'settings.tab_security': 'Security',
    'settings.tab_language': 'Language / اللغة',
    'settings.tab_billing': 'Stripe Billing',
    'settings.lang_heading': 'App Language & Localization',
    'settings.lang_desc': 'Customize your language experience across WorkChat. Full support for Moroccan Darija 🇲🇦 and world languages.',
    'settings.current_active': 'Current Active Language',
    'settings.change_lang': 'Change Language',
    'settings.save': 'Save Changes',
    'settings.update_password': 'Update Password',
    'settings.new_password': 'New Password',
    'settings.confirm_password': 'Confirm New Password',

    // Panel Security Code
    'panel_code.title_owner': 'Owner Security Gate Key',
    'panel_code.title_admin': 'Admin Security Gate Key',
    'panel_code.title_moderator': 'Moderator Security Gate Key',
    'panel_code.desc_owner': 'Change the master security access code required to unlock the Owner Root Console.',
    'panel_code.desc_admin': 'Change the access code required to unlock the Admin Management Console.',
    'panel_code.desc_moderator': 'Change the access code required to unlock the Moderator Console.',
    'panel_code.current_code': 'Current Active Code',
    'panel_code.new_code': 'New Security Access Code',
    'panel_code.help_text': 'Anyone trying to access this panel will need to enter this code at the gate modal.',
    'panel_code.update_button': 'Update Security Code',
    'panel_code.min_length': 'New security code must be at least 3 characters.',
    'panel_code.success': 'Access code updated successfully!',
    'panel_code.error': 'Failed to update access code.',

    // Common
    'common.copy': 'Copy',
    'common.copied': 'Copied!',
    'common.refresh': 'Refresh',
    'common.updating': 'Updating...',
    'common.save': 'Save',
    'common.cancel': 'Cancel',
    'common.delete': 'Delete',
    'common.edit': 'Edit',
    
    // Landing & Auth
    'landing.login': 'Sign In',
    'landing.register': 'Get Started',
    'landing.instant_account': 'Quick Guest Account',
    'landing.how_it_works': 'How It Works',
  },

  // 🇲🇦 Moroccan Darija (الدارجة المغربية)
  ary: {
    'nav.home': 'الدار (الرئيسية)',
    'nav.chat': 'الشات والميساجات',
    'nav.teams': 'الفِرق',
    'nav.friends': 'الصحاب',
    'nav.tasks': 'المهام ديالي',
    'nav.announcements': 'الإعلانات',
    'nav.work': 'الخدمة والمشاريع',
    'nav.notifications': 'الإشعارات',
    'nav.settings': 'الإعدادات والبارامتر',
    'nav.moderator_panel': 'لوحة المشرفين',
    'nav.admin_panel': 'لوحة الإدارة',
    'nav.owner_panel': 'لوحة المالك (Root)',
    'nav.logout': 'خروج من الحساب',
    'nav.main_workspace': 'مساحة الخدمة الرئيسية',
    'nav.management': 'الإدارة والمراقبة',

    'header.workspace': 'مساحة العمل',
    'header.search_placeholder': 'قلّب فالمساحة ديالك...',
    'header.search_shortcut': '⌘K',
    'header.notifications': 'الإشعارات',
    'header.language': 'اللغة',
    'header.choose_language': 'عزل اللغة (المغرب 🇲🇦)',

    'home.welcome_back': 'مرحبا بك من جديد،',
    'home.hero_title': 'خدموا مجموعين. بقاو منظمين. ساليو الخدمة بالخف.',
    'home.hero_desc': 'رجع لقنوات الفرقة ديالك، تبع المهام لي عندك، وشارك فمشاريع الخدمة مع صحابك.',
    'home.open_chat': 'حل الشات دابا',
    'home.browse_work': 'شوف مساحة WORK',
    'home.chat_subtitle': 'ميساجات نيشان',
    'home.teams_subtitle': 'مساحات الفرق',
    'home.tasks_subtitle': 'باقي مادرتيهمش',
    'home.announce_subtitle': 'أخبار وإعلانات',
    'home.work_subtitle': '15 صنف ديال الخدمة',
    'home.billing_subtitle': 'خلاص Stripe مأمن',
    'home.recent_deliverables': 'مشاريع الخدمة لي خدامين عليها',
    'home.view_all': 'شوف كولشي',
    'home.files': 'ملفات',
    'home.latest_announcement': 'آخر إعلان',
    'home.no_announcements': 'مازال ماكاين حتى إعلان منشور دابا.',
    'home.assigned_tasks': 'المهام لي عندك',
    'home.tasks_open': 'مفتوحين',

    'lang.title': 'عزل لغة التطبيق',
    'lang.subtitle': 'بدّل اللغة ديال WorkChat كيفما بغيتي. كاين كاع اللغات ومعاهم الدارجة المغربية 🇲🇦.',
    'lang.search_placeholder': 'قلّب على اللغة بالسمية ولا الحروف (مثال: المغرب, Darija, Français, العربية)...',
    'lang.moroccan_badge': 'المغرب 🇲🇦',
    'lang.moroccan_featured': 'اللغات المغربية (المغرب 🇲🇦)',
    'lang.all': 'كاع اللغات',
    'lang.featured': 'المعروفين والمفضلة',
    'lang.mena': 'المغرب وشمال إفريقيا 🇲🇦',
    'lang.europe': 'أوروبا',
    'lang.asia': 'آسيا والمحيط الهادئ',
    'lang.current': 'اللغة لي خدام بيها دابا',
    'lang.select_button': 'طبّق هاد اللغة',
    'lang.no_results': 'ما كاينا حتى لغة بهاد السمية',

    'settings.title': 'الحساب والبارامترات',
    'settings.subtitle': 'بدّل البروفيل ديالك، المودباس، لغة الواجهة، وخلاص الاشتراكات.',
    'settings.tab_profile': 'البروفيل',
    'settings.tab_security': 'الأمان',
    'settings.tab_language': 'اللغة (المغرب 🇲🇦)',
    'settings.tab_billing': 'الخلاص وStripe',
    'settings.lang_heading': 'لغة التطبيق والترجمة',
    'settings.lang_desc': 'بدّل لغة WorkChat بسهولة تامة مع دعم كامل للدارجة المغربية ولكاع لغات العالم.',
    'settings.current_active': 'اللغة المفعلة دابا',
    'settings.change_lang': 'بدّل اللغة',
    'settings.save': 'حفظ التغييرات',
    'settings.update_password': 'بدّل المودباس',
    'settings.new_password': 'المودباس الجديد',
    'settings.confirm_password': 'عاود المودباس الجديد',

    'panel_code.title_owner': 'كود الدخول ديال لوحة المالك (Owner)',
    'panel_code.title_admin': 'كود الدخول ديال لوحة الإدارة (Admin)',
    'panel_code.title_moderator': 'كود الدخول ديال لوحة المشرفين (Mod)',
    'panel_code.desc_owner': 'بدّل كود الأمان الرئيسي لي كيحل لوحة تحكم المالك.',
    'panel_code.desc_admin': 'بدّل كود الأمان لي كيحل لوحة تحكم الإدارة.',
    'panel_code.desc_moderator': 'بدّل كود الأمان لي كيحل لوحة المشرفين.',
    'panel_code.current_code': 'الكود لي مفعّل دابا',
    'panel_code.new_code': 'الكود الجديد ديال الأمان',
    'panel_code.help_text': 'أي واحد بغا يدخل لهاد اللوحة غادي يخصو يكتب هاد الكود فالنافذة ديال التحقق.',
    'panel_code.update_button': 'بدّل الكود دابا',
    'panel_code.min_length': 'الكود الجديد خاص يكون فيه على الأقل 3 ديال الحروف ولا الأرقام.',
    'panel_code.success': 'الكود تبدّل بنجاح!',
    'panel_code.error': 'وقع غلط وماتبدلش الكود.',

    'common.copy': 'نسخ',
    'common.copied': 'تكوبيا!',
    'common.refresh': 'تحيين',
    'common.updating': 'كنبدلو الكود...',
    'common.save': 'حفظ',
    'common.cancel': 'إلغاء',
    'common.delete': 'مسح',
    'common.edit': 'تعديل',

    'landing.login': 'دخول',
    'landing.register': 'تسجيل حساب جديد',
    'landing.instant_account': 'حساب تجريبي فالبلاصة',
    'landing.how_it_works': 'كيفاش كيخدم',
  },

  // 🇫🇷 French (Français)
  fr: {
    'nav.home': 'Accueil',
    'nav.chat': 'Chat & Messages',
    'nav.teams': 'Équipes',
    'nav.friends': 'Amis',
    'nav.tasks': 'Tâches',
    'nav.announcements': 'Annonces',
    'nav.work': 'Projets & Travail',
    'nav.notifications': 'Notifications',
    'nav.settings': 'Paramètres',
    'nav.moderator_panel': 'Console Modérateur',
    'nav.admin_panel': 'Console Administrateur',
    'nav.owner_panel': 'Console Propriétaire (Root)',
    'nav.logout': 'Déconnexion',
    'nav.main_workspace': 'Espace Principal',
    'nav.management': 'Administration & Contrôle',

    'header.workspace': 'Espace de travail',
    'header.search_placeholder': 'Rechercher dans l\'espace...',
    'header.search_shortcut': '⌘K',
    'header.notifications': 'Notifications',
    'header.language': 'Langue',
    'header.choose_language': 'Choisir la langue',

    'home.welcome_back': 'Bienvenue,',
    'home.hero_title': 'Travailler ensemble. Rester organisé. Obtenir des résultats.',
    'home.hero_desc': 'Rejoignez vos équipes, suivez vos tâches en cours et collaborez sur vos projets WORK avec vos collaborateurs.',
    'home.open_chat': 'Ouvrir le Chat Direct',
    'home.browse_work': 'Explorer WORK Studio',
    'home.chat_subtitle': 'Messages directs',
    'home.teams_subtitle': 'Espaces collaboratifs',
    'home.tasks_subtitle': 'en attente',
    'home.announce_subtitle': 'Diffusion entreprise',
    'home.work_subtitle': '15 Catégories PC',
    'home.billing_subtitle': 'Paiement Stripe sécurisé',
    'home.recent_deliverables': 'Livrables WORK en cours',
    'home.view_all': 'Voir tout',
    'home.files': 'fichiers',
    'home.latest_announcement': 'Dernière annonce',
    'home.no_announcements': 'Aucune annonce publiée pour le moment.',
    'home.assigned_tasks': 'Tâches assignées',
    'home.tasks_open': 'ouvertes',

    'lang.title': 'Choisir la langue de l\'interface',
    'lang.subtitle': 'Sélectionnez votre langue préférée. Plus de 40 langues disponibles dont la Darija marocaine 🇲🇦.',
    'lang.search_placeholder': 'Rechercher par nom, écriture ou pays (ex: Maroc, Darija, Français, العربية)...',
    'lang.moroccan_badge': 'Maroc / المغرب',
    'lang.moroccan_featured': 'Langues du Maroc (Maroc 🇲🇦)',
    'lang.all': 'Toutes les langues',
    'lang.featured': 'Populaires & Vedettes',
    'lang.mena': 'MENA & Maroc 🇲🇦',
    'lang.europe': 'Europe',
    'lang.asia': 'Asie & Pacifique',
    'lang.current': 'Langue actuellement active',
    'lang.select_button': 'Appliquer la langue',
    'lang.no_results': 'Aucune langue trouvée pour',

    'settings.title': 'Compte & Préférences',
    'settings.subtitle': 'Gérez votre profil personnel, sécurité, langue d\'interface et facturation Stripe.',
    'settings.tab_profile': 'Profil',
    'settings.tab_security': 'Sécurité',
    'settings.tab_language': 'Langue / اللغة',
    'settings.tab_billing': 'Facturation Stripe',
    'settings.lang_heading': 'Langue de l\'application',
    'settings.lang_desc': 'Changez la langue de l\'application à tout moment avec support officiel de la Darija marocaine 🇲🇦.',
    'settings.current_active': 'Langue actuellement activée',
    'settings.change_lang': 'Changer de langue',
    'settings.save': 'Enregistrer les modifications',
    'settings.update_password': 'Mettre à jour le mot de passe',
    'settings.new_password': 'Nouveau mot de passe',
    'settings.confirm_password': 'Confirmer le mot de passe',

    'panel_code.title_owner': 'Code de sécurité de la console Propriétaire',
    'panel_code.title_admin': 'Code de sécurité de la console Administrateur',
    'panel_code.title_moderator': 'Code de sécurité de la console Modérateur',
    'panel_code.desc_owner': 'Modifiez le code d\'accès maître nécessaire pour déverrouiller la console Propriétaire.',
    'panel_code.desc_admin': 'Modifiez le code d\'accès nécessaire pour déverrouiller la console Administrateur.',
    'panel_code.desc_moderator': 'Modifiez le code d\'accès nécessaire pour déverrouiller la console Modérateur.',
    'panel_code.current_code': 'Code actif actuel',
    'panel_code.new_code': 'Nouveau code d\'accès de sécurité',
    'panel_code.help_text': 'Toute personne tentant d\'accéder à ce panneau devra saisir ce code lors du verrou de sécurité.',
    'panel_code.update_button': 'Mettre à jour le code',
    'panel_code.min_length': 'Le nouveau code doit comporter au moins 3 caractères.',
    'panel_code.success': 'Code d\'accès mis à jour avec succès !',
    'panel_code.error': 'Échec de la mise à jour du code d\'accès.',

    'common.copy': 'Copier',
    'common.copied': 'Copié !',
    'common.refresh': 'Actualiser',
    'common.updating': 'Mise à jour...',
    'common.save': 'Enregistrer',
    'common.cancel': 'Annuler',
    'common.delete': 'Supprimer',
    'common.edit': 'Modifier',

    'landing.login': 'Connexion',
    'landing.register': 'Commencer',
    'landing.instant_account': 'Compte Invité Immédiat',
    'landing.how_it_works': 'Comment ça marche',
  },

  // 🇸🇦 Arabic (العربية الفصحى)
  ar: {
    'nav.home': 'الرئيسية',
    'nav.chat': 'المحادثات',
    'nav.teams': 'فرق العمل',
    'nav.friends': 'الأصدقاء',
    'nav.tasks': 'المهام',
    'nav.announcements': 'الإعلانات',
    'nav.work': 'مساحة العمل',
    'nav.notifications': 'الإشعارات',
    'nav.settings': 'الإعدادات',
    'nav.moderator_panel': 'لوحة الإشراف',
    'nav.admin_panel': 'لوحة الإدارة',
    'nav.owner_panel': 'لوحة المالك (Root)',
    'nav.logout': 'تسجيل الخروج',
    'nav.main_workspace': 'مساحة العمل الرئيسية',
    'nav.management': 'الإدارة والتحكم',

    'header.workspace': 'مساحة العمل',
    'header.search_placeholder': 'ابحث في مساحة العمل...',
    'header.search_shortcut': '⌘K',
    'header.notifications': 'الإشعارات',
    'header.language': 'اللغة',
    'header.choose_language': 'اختر اللغة',

    'home.welcome_back': 'أهلاً بك مجدداً،',
    'home.hero_title': 'اعملوا معاً. حافظوا على التنظيم. أنجزوا الأعمال.',
    'home.hero_desc': 'عُد إلى قنوات فريقك، وتابع مهامك الحالية، وتعاون في مشاريع العمل مع زملائك.',
    'home.open_chat': 'فتح المحادثات المباشرة',
    'home.browse_work': 'استعراض استوديو العمل',
    'home.chat_subtitle': 'رسائل مباشرة',
    'home.teams_subtitle': 'مساحات تعاونية',
    'home.tasks_subtitle': 'قيد الانتظار',
    'home.announce_subtitle': 'إعلانات المنظمة',
    'home.work_subtitle': '15 تصنيف عمل',
    'home.billing_subtitle': 'دفع آمن عبر Stripe',
    'home.recent_deliverables': 'مشاريع العمل الجارية',
    'home.view_all': 'عرض الكل',
    'home.files': 'ملفات',
    'home.latest_announcement': 'آخر إعلان',
    'home.no_announcements': 'لم يتم نشر أي إعلانات حتى الآن.',
    'home.assigned_tasks': 'المهام المسندة',
    'home.tasks_open': 'مفتوحة',

    'lang.title': 'اختر لغة واجهة التطبيق',
    'lang.subtitle': 'اختر لغتك المفضلة من بين أكثر من 40 لغة عالمية بما في ذلك الدارجة المغربية 🇲🇦.',
    'lang.search_placeholder': 'ابحث عن أي لغة بالاسم أو الدولة (مثل: المغرب، الدارجة، العربية، English)...',
    'lang.moroccan_badge': 'المغرب 🇲🇦',
    'lang.moroccan_featured': 'لغات المغرب (المغرب 🇲🇦)',
    'lang.all': 'جميع اللغات',
    'lang.featured': 'الشائعة والمميزة',
    'lang.mena': 'الشرق الأوسط والمغرب العربي 🇲🇦',
    'lang.europe': 'أوروبا',
    'lang.asia': 'آسيا والمحيط الهادئ',
    'lang.current': 'اللغة النشطة حالياً',
    'lang.select_button': 'تطبيق اللغة',
    'lang.no_results': 'لم يتم العثور على لغات تطابق',

    'settings.title': 'الحساب والتفضيلات',
    'settings.subtitle': 'إدارة الملف الشخصي، الأمان، لغة الواجهة، واشتراكات Stripe.',
    'settings.tab_profile': 'الملف الشخصي',
    'settings.tab_security': 'الأمان',
    'settings.tab_language': 'اللغة / Language',
    'settings.tab_billing': 'الفواتير والاشتراكات',
    'settings.lang_heading': 'لغة التطبيق والتعريب',
    'settings.lang_desc': 'تخصيص لغة WorkChat بسهولة مع دعم متميز للدارجة المغربية ولكافة اللغات العالمية.',
    'settings.current_active': 'اللغة المفعلة حالياً',
    'settings.change_lang': 'تغيير اللغة',
    'settings.save': 'حفظ التعديلات',
    'settings.update_password': 'تحديث كلمة المرور',
    'settings.new_password': 'كلمة المرور الجديدة',
    'settings.confirm_password': 'تأكيد كلمة المرور الجديدة',

    'panel_code.title_owner': 'رمز أمان لوحة المالك',
    'panel_code.title_admin': 'رمز أمان لوحة الإدارة',
    'panel_code.title_moderator': 'رمز أمان لوحة المشرفين',
    'panel_code.desc_owner': 'تغيير رمز المرور الرئيسي المطلوب لفتح لوحة تحكم المالك.',
    'panel_code.desc_admin': 'تغيير رمز المرور المطلوب لفتح لوحة تحكم الإدارة.',
    'panel_code.desc_moderator': 'تغيير رمز المرور المطلوب لفتح لوحة تحكم المشرفين.',
    'panel_code.current_code': 'الرمز النشط حالياً',
    'panel_code.new_code': 'رمز الأمان الجديد',
    'panel_code.help_text': 'سيتعين على أي شخص يحاول الوصول إلى هذه اللوحة إدخال هذا الرمز عند بوابة التحقق.',
    'panel_code.update_button': 'تحديث رمز الأمان',
    'panel_code.min_length': 'يجب أن يتكون الرمز الجديد من 3 أحرف أو أرقام على الأقل.',
    'panel_code.success': 'تم تحديث رمز الأمان بنجاح!',
    'panel_code.error': 'فشل تحديث رمز الأمان.',

    'common.copy': 'نسخ',
    'common.copied': 'تم النسخ!',
    'common.refresh': 'تحديث',
    'common.updating': 'جاري التحديث...',
    'common.save': 'حفظ',
    'common.cancel': 'إلغاء',
    'common.delete': 'حذف',
    'common.edit': 'تعديل',

    'landing.login': 'تسجيل الدخول',
    'landing.register': 'ابدأ الآن',
    'landing.instant_account': 'حساب تجريبي فوري',
    'landing.how_it_works': 'كيف يعمل',
  },
};

// Phrase mapping dictionary so ANY English phrase or fallback used in the app translates smoothly
export const PHRASE_DICTIONARY: Record<string, Record<string, string>> = {
  es: {
    // Buttons & Actions
    'Save Changes': 'Guardar Cambios',
    'Save': 'Guardar',
    'Cancel': 'Cancelar',
    'Delete': 'Eliminar',
    'Edit': 'Editar',
    'Close': 'Cerrar',
    'Refresh': 'Actualizar',
    'Update': 'Actualizar',
    'Search': 'Buscar',
    'Back': 'Volver',
    'Confirm': 'Confirmar',
    'Done': 'Hecho',
    'Apply': 'Aplicar',
    'Sign Out': 'Cerrar Sesión',
    'Log Out': 'Cerrar Sesión',
    'Sign In': 'Iniciar Sesión',
    'Log In': 'Iniciar Sesión',
    'Register': 'Registrarse',

    // Titles & Sections
    'Home': 'Inicio',
    'Chat': 'Chat',
    'Teams': 'Equipos',
    'Friends': 'Amigos',
    'Tasks': 'Tareas',
    'Announcements': 'Anuncios',
    'WORK': 'TRABAJO',
    'Notifications': 'Notificaciones',
    'Settings': 'Configuración',
    'Profile': 'Perfil',
    'Security': 'Seguridad',
    'Language': 'Idioma',
    'Billing': 'Facturación',
    'Moderator Panel': 'Panel de Moderador',
    'Admin Panel': 'Panel de Administración',
    'Owner Panel': 'Panel de Propietario',
    'Security Access Key': 'Clave de Acceso de Seguridad',
    'Confidential': 'Confidencial',
    'Enter security access key': 'Introduce la clave de acceso de seguridad',
    'Unlock Secure Panel': 'Desbloquear Panel Seguro',
    'Verifying Security Key...': 'Verificando Clave de Seguridad...',
    'Identity & role authenticated. Entering secure console...': 'Identidad y rol autenticados. Ingresando a la consola segura...',
    'Code invalide.': 'Código inválido.',
    'Invalid code.': 'Código inválido.',
  },

  fr: {
    'Save Changes': 'Enregistrer les modifications',
    'Save': 'Enregistrer',
    'Cancel': 'Annuler',
    'Delete': 'Supprimer',
    'Edit': 'Modifier',
    'Close': 'Fermer',
    'Refresh': 'Actualiser',
    'Update': 'Mettre à jour',
    'Search': 'Rechercher',
    'Back': 'Retour',
    'Confirm': 'Confirmer',
    'Done': 'Terminé',
    'Apply': 'Appliquer',
    'Sign Out': 'Déconnexion',
    'Log Out': 'Déconnexion',
    'Sign In': 'Connexion',
    'Log In': 'Connexion',
    'Register': 'S\'inscrire',
    'Home': 'Accueil',
    'Chat': 'Chat',
    'Teams': 'Équipes',
    'Friends': 'Amis',
    'Tasks': 'Tâches',
    'Announcements': 'Annonces',
    'WORK': 'TRAVAIL',
    'Notifications': 'Notifications',
    'Settings': 'Paramètres',
    'Profile': 'Profil',
    'Security': 'Sécurité',
    'Language': 'Langue',
    'Billing': 'Facturation',
    'Moderator Panel': 'Console Modérateur',
    'Admin Panel': 'Console Administrateur',
    'Owner Panel': 'Console Propriétaire',
  },

  ary: {
    'Save Changes': 'حفظ التغييرات',
    'Save': 'حفظ',
    'Cancel': 'إلغاء',
    'Delete': 'مسح',
    'Edit': 'تعديل',
    'Close': 'سدّ',
    'Refresh': 'تحيين',
    'Update': 'تحديث',
    'Search': 'بحث',
    'Back': 'رجوع',
    'Sign Out': 'خروج من الحساب',
    'Home': 'الدار',
    'Chat': 'الشات',
    'Teams': 'الفِرق',
    'Friends': 'الصحاب',
    'Tasks': 'المهام',
    'Announcements': 'الإعلانات',
    'WORK': 'الخدمة',
    'Notifications': 'الإشعارات',
    'Settings': 'الإعدادات',
  }
};

interface LanguageContextType {
  language: string;
  setLanguage: (code: string) => void;
  currentLanguage: LanguageInfo;
  allLanguages: LanguageInfo[];
  t: (key: string, fallback?: string) => string;
  isRtl: boolean;
  openLanguageModal: () => void;
  closeLanguageModal: () => void;
  isLanguageModalOpen: boolean;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<string>(() => {
    try {
      const saved = localStorage.getItem('workchat_language');
      if (saved && ALL_LANGUAGES.some((l) => l.code === saved)) {
        return saved;
      }
    } catch {}
    return 'en';
  });

  const [isLanguageModalOpen, setIsLanguageModalOpen] = useState(false);

  const currentLanguage =
    ALL_LANGUAGES.find((l) => l.code === language) || ALL_LANGUAGES[3]; // Fallback to English

  const isRtl = Boolean(currentLanguage.isRtl);

  const setLanguage = (code: string) => {
    if (ALL_LANGUAGES.some((l) => l.code === code)) {
      setLanguageState(code);
      try {
        localStorage.setItem('workchat_language', code);
      } catch {}
    }
  };

  useEffect(() => {
    document.documentElement.lang = language;
    if (isRtl) {
      document.documentElement.dir = 'rtl';
    } else {
      document.documentElement.dir = 'ltr';
    }
  }, [language, isRtl]);

  const t = (key: string, fallback?: string): string => {
    // 1. Direct dictionary match for the key
    const currentDict = TRANSLATIONS[language];
    if (currentDict && currentDict[key]) {
      return currentDict[key];
    }

    // 2. Direct phrase dictionary match
    const phraseDict = PHRASE_DICTIONARY[language];
    if (phraseDict) {
      if (phraseDict[key]) return phraseDict[key];
      if (fallback && phraseDict[fallback]) return phraseDict[fallback];
    }

    // 3. Fallback to English dictionary
    const enDict = TRANSLATIONS['en'];
    if (enDict && enDict[key]) {
      return enDict[key];
    }

    // 4. Default fallback or key itself
    return fallback !== undefined ? fallback : key;
  };

  return (
    <LanguageContext.Provider
      value={{
        language,
        setLanguage,
        currentLanguage,
        allLanguages: ALL_LANGUAGES,
        t,
        isRtl,
        openLanguageModal: () => setIsLanguageModalOpen(true),
        closeLanguageModal: () => setIsLanguageModalOpen(false),
        isLanguageModalOpen,
      }}
    >
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = (): LanguageContextType => {
  const ctx = useContext(LanguageContext);
  if (!ctx) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return ctx;
};
