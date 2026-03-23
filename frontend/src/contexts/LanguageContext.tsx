'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export type Language = 'en' | 'km';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const translationFallbacks: Record<string, string> = {
  'admin.categories': 'common.categories',
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};

interface LanguageProviderProps {
  children: ReactNode;
}

export const LanguageProvider: React.FC<LanguageProviderProps> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>('en');

  useEffect(() => {
    // Load saved language from localStorage
    const savedLanguage = localStorage.getItem('language') as Language;
    if (savedLanguage && (savedLanguage === 'en' || savedLanguage === 'km')) {
      setLanguageState(savedLanguage);
    }
  }, []);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem('language', lang);
    document.documentElement.lang = lang;
  };

  const t = (key: string): string => {
    const keys = key.split('.');
    let value: any = translations[language];
    
    for (const k of keys) {
      if (value && typeof value === 'object' && k in value) {
        value = value[k];
      } else {
        const fallbackKey = translationFallbacks[key];
        if (fallbackKey) {
          return t(fallbackKey);
        }
        return key;
      }
    }
    
    return value || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

// Translations
const translations: Record<Language, any> = {
  en: {
    common: {
      home: 'Home',
      menu: 'Menu',
      cart: 'Cart',
      orders: 'Orders',
      login: 'Login',
      logout: 'Logout',
      loading: 'Loading...',
      error: 'Error',
      success: 'Success',
      cancel: 'Cancel',
      confirm: 'Confirm',
      save: 'Save',
      delete: 'Delete',
      edit: 'Edit',
      add: 'Add',
      search: 'Search',
      table: 'Table',
      price: 'Price',
      total: 'Total',
      quantity: 'Quantity',
      description: 'Description',
      category: 'Category',
      categories: 'Categories',
      all: 'All',
      language: 'Language',
      khmer: 'Khmer',
      english: 'English',
    },
    home: {
      title: 'Elevate Your Restaurant Experience with OrderHey QR Menus',
      subtitle: 'Transform your dining operations with OrderHey\'s intuitive and efficient QR code menu system. Delight your customers with a seamless ordering experience, reduce operational costs, and keep your menu effortlessly up-to-date in real-time.',
      getStarted: 'Get Started Now',
      learnMore: 'Learn More',
      whyChooseUs: 'Why Choose OrderHey?',
      adminControl: 'Powerful Admin Control',
      adminControlDesc: 'Manage every aspect of your restaurant effortlessly from a single, intuitive dashboard. OrderHey provides you with the tools to stay in control.',
      pricing: 'Simple, Transparent Pricing',
      pricingDesc: 'One affordable price for all the features you need.',
      features: {
        seamlessOrdering: 'Seamless Ordering',
        seamlessOrderingDesc: 'Customers scan, browse, and order directly from their smartphones, eliminating physical menus and waiting times.',
        costEfficiency: 'Cost Efficiency',
        costEfficiencyDesc: 'Reduce printing costs, minimize errors, and optimize staff workload with a streamlined digital process.',
        realTimeUpdates: 'Real-time Updates',
        realTimeUpdatesDesc: 'Instantly update prices, mark items as out of stock, or add new specials without reprinting a single menu.',
        analytics: 'Insightful Analytics',
        analyticsDesc: 'Track popular dishes, peak ordering times, and customer preferences to make data-driven business decisions.',
        support: 'Dedicated Support',
        supportDesc: 'Our team is here to assist you every step of the way, ensuring a smooth transition and continuous operation.',
        mobileFirst: 'Mobile-First Design',
        mobileFirstDesc: 'Your digital menu looks stunning and functions flawlessly on any smartphone or tablet device.',
      },
      adminFeatures: {
        dashboard: 'Dashboard Overview',
        dashboardDesc: 'Get a comprehensive view of your restaurant\'s performance with real-time analytics and insights.',
        menuManagement: 'Menu Management',
        menuManagementDesc: 'Easily add, edit, or remove menu items. Update prices and descriptions instantly.',
        orderTracking: 'Order Tracking',
        orderTrackingDesc: 'Monitor all incoming orders in real-time and track their preparation status.',
        staffManagement: 'Staff Management',
        staffManagementDesc: 'Manage staff accounts, assign roles, and track performance metrics.',
        tableManagement: 'Table Management',
        tableManagementDesc: 'Organize your restaurant layout and track table occupancy effortlessly.',
        reports: 'Reports & Analytics',
        reportsDesc: 'Generate detailed reports on sales, popular items, and customer behavior.',
      },
    },
    login: {
      title: 'Login to Your Account',
      email: 'Email',
      password: 'Password',
      loginButton: 'Login',
      errorMessage: 'Login failed. Please check your credentials and try again.',
      unknownRole: 'Unknown role. Please contact support.',
    },
    order: {
      title: 'Place Your Order',
      loadingMenu: 'Loading Menu...',
      searchPlaceholder: 'Search for delicious dishes...',
      yourOrders: 'Your Orders',
      noOrders: 'No orders placed yet. Start exploring our menu!',
      cart: {
        title: 'Your Cart',
        empty: 'Your cart is empty. Add some delicious items!',
        total: 'Total',
        placeOrder: 'Place Order Now',
      },
      confirmation: {
        title: 'Order Successfully Placed!',
        message: 'We will process your order as soon as possible.',
        continueShopping: 'CONTINUE SHOPPING',
      },
      addToCart: 'Add to Cart',
      outOfStock: 'Out of Stock',
    },
    admin: {
      dashboard: 'Dashboard',
      categories: 'Categories',
      menu: 'Menu Management',
      orders: 'Orders',
      tables: 'Tables',
      staff: 'Staff',
      settings: 'Settings',
      reports: 'Reports',
    },
    pricing: {
      title: 'Simple, Transparent Pricing',
      price: '$9.99',
      period: '/month',
      features: [
        'Unlimited QR Codes',
        'Unlimited Menu Items',
        'Real-time Updates',
        'Analytics Dashboard',
        '24/7 Support',
        'Multi-language Support',
      ],
      signup: 'Sign Up Now',
    },
    footer: {
      rights: 'All rights reserved.',
      contact: 'Contact Us',
      followUs: 'Follow Us',
    },
  },
  km: {
    common: {
      home: 'ទំព័រដើម',
      menu: 'ម៉ឺនុយ',
      cart: 'កន្ត្រក',
      orders: 'ការបញ្ជាទិញ',
      login: 'ចូល',
      logout: 'ចាកចេញ',
      loading: 'កំពុងផ្ទុក...',
      error: 'កំហុស',
      success: 'ជោគជ័យ',
      cancel: 'បោះបង់',
      confirm: 'បញ្ជាក់',
      save: 'រក្សាទុក',
      delete: 'លុប',
      edit: 'កែសម្រួល',
      add: 'បន្ថែម',
      search: 'ស្វែងរក',
      table: 'តុ',
      price: 'តម្លៃ',
      total: 'សរុប',
      quantity: 'ចំនួន',
      description: 'ការពិពណ៌នា',
      category: 'ប្រភេទ',
      categories: 'ប្រភេទ',
      all: 'ទាំងអស់',
      language: 'ភាសា',
      khmer: 'ខ្មែរ',
      english: 'អង់គ្លេស',
    },
    home: {
      title: 'លើកកម្ពស់បទពិសោធន៍ភោជនីយដ្ឋានរបស់អ្នកជាមួយម៉ឺនុយ QR OrderHey',
      subtitle: 'បំប្លែងប្រតិបត្តិការអាហាររបស់អ្នកជាមួយប្រព័ន្ធម៉ឺនុយ QR ដ៏មានប្រសិទ្ធភាពរបស់ OrderHey។ ធ្វើឱ្យអតិថិជនរបស់អ្នកពេញចិត្តជាមួយបទពិសោធន៍ការបញ្ជាទិញដ៏រលូន កាត់បន្ថយថ្លៃដើមប្រតិបត្តិការ និងរក្សាម៉ឺនុយរបស់អ្នកឱ្យទាន់សម័យជានិច្ច។',
      getStarted: 'ចាប់ផ្តើមឥឡូវនេះ',
      learnMore: 'ស្វែងយល់បន្ថែម',
      whyChooseUs: 'ហេតុអ្វីជ្រើសរើស OrderHey?',
      adminControl: 'ការគ្រប់គ្រង Admin ដ៏មានឥទ្ធិពល',
      adminControlDesc: 'គ្រប់គ្រងរាល់ដំណាក់កាលនៃភោជនីយដ្ឋានរបស់អ្នកយ៉ាងងាយស្រួលពីផ្ទាំងគ្រប់គ្រងតែមួយ។ OrderHey ផ្តល់ជូនអ្នកនូវឧបករណ៍ដើម្បីស្ថិតក្នុងការគ្រប់គ្រង។',
      pricing: 'តម្លៃសាមញ្ញ និងច្បាស់លាស់',
      pricingDesc: 'តម្លៃសមរម្យតែមួយសម្រាប់មុខងារទាំងអស់ដែលអ្នកត្រូវការ។',
      features: {
        seamlessOrdering: 'ការបញ្ជាទិញដ៏រលូន',
        seamlessOrderingDesc: 'អតិថិជនអាចស្កែន មើល និងបញ្ជាទិញផ្ទាល់ពីស្មាតហ្វូនរបស់ពួកគេ លុបបំបាត់ម៉ឺនុយរូបវន្ត និងពេលវេលារង់ចាំ។',
        costEfficiency: 'ប្រសិទ្ធភាពថ្លៃដើម',
        costEfficiencyDesc: 'កាត់បន្ថយថ្លៃដើមបោះពុម្ព កាត់បន្ថយកំហុស និងធ្វើឱ្យប្រសើរឡើងនូវបន្ទុកការងាររបស់បុគ្គលិកជាមួយនឹងដំណើរការឌីជីថល។',
        realTimeUpdates: 'ការធ្វើបច្ចុប្បន្នភាពភ្លាមៗ',
        realTimeUpdatesDesc: 'ធ្វើបច្ចុប្បន្នភាពតម្លៃ កំណត់មុខម្ហូបអស់ ឬបន្ថែមមុខម្ហូបពិសេសថ្មីភ្លាមៗ ដោយមិនចាំបាច់បោះពុម្ពម៉ឺនុយឡើងវិញ។',
        analytics: 'វិភាគទិន្នន័យ',
        analyticsDesc: 'តាមដានមុខម្ហូបពេញនិយម ម៉ោងបញ្ជាទិញខ្ពស់ និងចំណូលចិត្តរបស់អតិថិជន ដើម្បីធ្វើការសម្រេចចិត្តផ្អែកលើទិន្នន័យ។',
        support: 'ការគាំទ្រពិសេស',
        supportDesc: 'ក្រុមរបស់យើងនៅទីនេះដើម្បីជួយអ្នកគ្រប់ជំហាន ធានានូវការផ្លាស់ប្តូរដ៏រលូន និងប្រតិបត្តិការជាបន្តបន្ទាប់។',
        mobileFirst: 'ការរចនាផ្តោតលើទូរស័ព្ទ',
        mobileFirstDesc: 'ម៉ឺនុយឌីជីថលរបស់អ្នកមើលទៅស្អាត និងដំណើរការយ៉ាងរលូនលើស្មាតហ្វូន ឬថេប្លេតគ្រប់ប្រភេទ។',
      },
      adminFeatures: {
        dashboard: 'ផ្ទាំងគ្រប់គ្រង',
        dashboardDesc: 'ទទួលបានទិដ្ឋភាពទូលំទូលាយនៃដំណើរការភោជនីយដ្ឋានរបស់អ្នកជាមួយនឹងការវិភាគ និងការយល់ដឹងពេលវេលាជាក់ស្តែង។',
        menuManagement: 'ការគ្រប់គ្រងម៉ឺនុយ',
        menuManagementDesc: 'បន្ថែម កែសម្រួល ឬលុបមុខម្ហូបក្នុងម៉ឺនុយយ៉ាងងាយស្រួល។ ធ្វើបច្ចុប្បន្នភាពតម្លៃ និងការពិពណ៌នាភ្លាមៗ។',
        orderTracking: 'ការតាមដានការបញ្ជាទិញ',
        orderTrackingDesc: 'តាមដានរាល់ការបញ្ជាទិញចូលថ្មីៗ និងតាមដានស្ថានភាពរៀបចំរបស់ពួកវា។',
        staffManagement: 'ការគ្រប់គ្រងបុគ្គលិក',
        staffManagementDesc: 'គ្រប់គ្រងគណនីបុគ្គលិក កំណត់តួនាទី និងតាមដានសូចនាករការអនុវត្ត។',
        tableManagement: 'ការគ្រប់គ្រងតុ',
        tableManagementDesc: 'រៀបចំប្លង់ភោជនីយដ្ឋានរបស់អ្នក និងតាមដានការកាន់កាប់តុយ៉ាងងាយស្រួល។',
        reports: 'របាយការណ៍ និងវិភាគ',
        reportsDesc: 'បង្កើតរបាយការណ៍លម្អិតអំពីការលក់ មុខម្ហូបពេញនិយម និងឥរិយាបថអតិថិជន។',
      },
    },
    login: {
      title: 'ចូលទៅកាន់គណនីរបស់អ្នក',
      email: 'អ៊ីមែល',
      password: 'ពាក្យសម្ងាត់',
      loginButton: 'ចូល',
      errorMessage: 'ការចូលបរាជ័យ។ សូមពិនិត្យមើលព័ត៌មានរបស់អ្នកហើយព្យាយាមម្តងទៀត។',
      unknownRole: 'តួនាទីមិនស្គាល់។ សូមទាក់ទងផ្នែកគាំទ្រ។',
    },
    order: {
      title: 'ដាក់ការបញ្ជាទិញរបស់អ្នក',
      loadingMenu: 'កំពុងផ្ទុកម៉ឺនុយ...',
      searchPlaceholder: 'ស្វែងរកមុខម្ហូបឆ្ងាញ់ៗ...',
      yourOrders: 'ការបញ្ជាទិញរបស់អ្នក',
      noOrders: 'មិនទាន់មានការបញ្ជាទិញ។ ចាប់ផ្តើមស្វែងរកម៉ឺនុយរបស់យើង!',
      cart: {
        title: 'កន្ត្រករបស់អ្នក',
        empty: 'កន្ត្រករបស់អ្នកទទេ។ បន្ថែមមុខម្ហូបឆ្ងាញ់ៗ!',
        total: 'សរុប',
        placeOrder: 'ដាក់ការបញ្ជាទិញ',
      },
      confirmation: {
        title: 'ការបញ្ជាទិញបានជោគជ័យ!',
        message: 'យើងនឹងដំណើរការការបញ្ជាទិញរបស់អ្នកឆាប់ៗនេះ។',
        continueShopping: 'បន្តការទិញ',
      },
      addToCart: 'បន្ថែមទៅកន្ត្រក',
      outOfStock: 'អស់ពីស្តុក',
    },
    admin: {
      dashboard: 'ផ្ទាំងគ្រប់គ្រង',
      menu: 'ការគ្រប់គ្រងម៉ឺនុយ',
      orders: 'ការបញ្ជាទិញ',
      tables: 'តុ',
      staff: 'បុគ្គលិក',
      settings: 'ការកំណត់',
      reports: 'របាយការណ៍',
    },
    pricing: {
      title: 'តម្លៃសាមញ្ញ និងច្បាស់លាស់',
      price: '$9.99',
      period: '/ខែ',
      features: [
        'កូដ QR មិនកំណត់',
        'មុខម្ហូបក្នុងម៉ឺនុយមិនកំណត់',
        'ការធ្វើបច្ចុប្បន្នភាពភ្លាមៗ',
        'ផ្ទាំងវិភាគ',
        'ការគាំទ្រ 24/7',
        'ការគាំទ្រច្រើនភាសា',
      ],
      signup: 'ចុះឈ្មោះឥឡូវនេះ',
    },
    footer: {
      rights: 'រក្សាសិទ្ធិគ្រប់យ៉ាង។',
      contact: 'ទាក់ទងយើង',
      followUs: 'តាមដានយើង',
    },
  },
};
