import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

// Import language resources
const resources = {
  en: {
    translation: {
      tickets: {
        ongoing: {
          title: 'Ongoing Tickets',
          description: 'View and manage tickets in progress',
          listTitle: 'Ongoing Tickets List',
          listDescription: 'All tickets currently being processed'
        },
        actions: {
          assign: 'Assign',
          complete: 'Complete',
          delete: 'Delete',
          close: 'Close',
          reopen: 'Reopen',
          view: 'View'
        },
        closed: {
          title: 'Closed Tickets',
          description: 'View completed and archived tickets',
          listTitle: 'Closed Tickets List',
          listDescription: 'All completed and archived tickets'
        },
        create: {
          description: 'Create a new ticket using a template',
          selectTemplate: 'Select Template',
          templatePlaceholder: 'Choose a template...',
          titlePlaceholder: 'Enter ticket title...'
        },
        list: {
          title: 'Title',
          currentStep: 'Current Step',
          assignee: 'Assignee',
          priority: 'Priority',
          status: 'Status',
          lastUpdated: 'Last Updated',
          unassigned: 'Unassigned',
          assignedTo: 'Assigned to {{id}}',
          completionRate: 'Completion Rate',
          finalAssignee: 'Final Assignee',
        },
        priority: {
          low: 'Low',
          medium: 'Medium',
          high: 'High'
        },
        status: {
          ongoing: 'In Progress',
          completed: 'Completed',
          closed: 'Closed',
          deleted: 'Deleted',
          archived: 'Archived',
          pending: 'Pending'
        },
        form: {
          required: 'Required',
          submit: 'Submit',
          description: 'Description',
          saveDraft: 'Save Draft',
        },
        assign: {
          title: 'Assign Ticket',
          description: 'Assign this ticket to a user',
          confirmation: 'Assign this ticket to yourself?',
        }
      },
      common: {
        loading: 'Loading...',
        error: 'An error occurred',
        save: 'Save',
        cancel: 'Cancel',
        delete: 'Delete',
        edit: 'Edit',
        create: 'Create',
        search: 'Search...',
        profile: 'Profile',
        userPreferences: 'Preferences',
        logout: 'Sign Out',
        confirmDelete: 'Confirm Delete',
        actionCannotBeUndone: 'This action cannot be undone.',
        comingSoon: 'Coming Soon',
        actions: 'Actions',
        submit: 'Submit',
        reset: 'Reset',
        apply: 'Apply',
        back: 'Back',
        next: 'Next',
        finish: 'Finish',
        close: 'Close',
        view: 'View',
        refresh: 'Refresh',
        more: 'More',
        settings: 'Settings',
        help: 'Help',
        about: 'About',
        success: 'Success',
        warning: 'Warning',
        info: 'Information',
        confirm: 'Confirm',
        required: 'Required',
        optional: 'Optional',
        enabled: 'Enabled',
        disabled: 'Disabled',
        status: 'Status',
        details: 'Details',
        filter: 'Filter',
        sort: 'Sort',
        export: 'Export',
        import: 'Import',
        yes: 'Yes',
        no: 'No',
        unsavedChanges: 'Unsaved Changes',
        unsavedChangesDescription: 'You have unsaved changes. Are you sure you want to discard them?',
        discard: 'Discard',
        expand: 'Expand',
        collapse: 'Collapse',
        showing: 'Showing',
        of: 'of',
        previousPage: 'Previous',
        nextPage: 'Next',
        dragAndDropOrClick: 'Drag and drop or click to upload',
        to: 'to',
        entries: 'Entries',
        page: 'Page',
      },
      components: {
        multiSelect: {
          search: 'Type to search...',
          selectAll: 'Select All',
          clear: 'Clear',
          close: 'Close',
          noResults: 'No results found',
          selected: '{{count}} selected'
        }
      },
      auth: {
        login: {
          title: '登录',
          usernameLabel: '用户名',
          passwordLabel: '密码',
          submit: '登录',
          loggingIn: '登录中...',
          noAccount: '还没有账号？',
          registerLink: '注册'
        },
        register: {
          title: '创建账号',
          description: '请输入您的信息以创建账号',
          usernameLabel: '用户名',
          fullNameLabel: '姓名',
          emailLabel: '邮箱',
          passwordLabel: '密码',
          confirmPasswordLabel: '确认密码',
          submit: '注册',
          registering: '注册中...',
          haveAccount: '已有账号？',
          loginLink: '登录',
          passwordMismatch: '两次输入的密码不一致',
          error: '注册失败'
        },
        logout: 'Logout',
        email: 'Email',
        password: 'Password',
        errors: {
          connectionFailed: 'Failed to connect to the server',
          incorrectCredentials: 'Incorrect username or password',
          accountLocked: 'Account is locked or disabled',
          userNotFound: 'User not found',
          tooManyAttempts: 'Too many login attempts. Please try again later',
          serverError: 'Server error. Please try again later',
          defaultError: 'An error occurred during login',
          fetchUserFailed: 'Failed to fetch user information',
          sessionExpired: 'Session expired, please login again',
          noRefreshToken: 'No refresh token available'
        }
      },
      navigation: {
        overview: {
          title: 'Overview',
          insights: 'Insights',
        },
        tickets: {
          title: 'Tickets',
          newTicket: 'New Ticket',
          status: 'Status',
          priority: 'Priority',
          assignee: 'Assignee',
          description: 'Description',
          opened: 'Opened',
          closed: 'Closed',
          viewMode: {
            table: 'Table View',
            workflow: 'Workflow View'
          }
        },
        management: {
          title: 'Management',
          template: 'Template',
          templateList: 'Template List',
          createTemplate: 'Create Template',
          resource: 'Resource',
          users: 'Users'
        }
      },
      insights: {
        title: 'Insights',
        description: 'Gain insights into your performance and usage',
        selectTimeRange: 'Select Time Range',
        selectType: 'Select Type', 
        export: 'Export Data',
        metrics: {
          totalTickets: 'Total Tickets',
          averageResolutionTime: 'Average Resolution Time',
          activeResources: 'Active Resources',
          activeUsers: 'Active Users',
          days: 'days'
        },
        type: {
          all: 'All Data',
          ticket: 'Tickets',
          user: 'Users',
          resource: 'Resources'
        },
        timeRange: {
          week: 'Last 7 Days',
          month: 'Last 30 Days', 
          quarter: 'Last 90 Days',
          year: 'Last 365 Days'
        },
        charts: {
          ticketDistribution: 'Ticket Distribution',
          ticketDistributionDesc: 'Distribution of tickets by priority',
          resolutionTime: 'Resolution Time',
          resolutionTimeDesc: 'Average time to resolve tickets'
        },
        table: {
          title: 'Data Overview',
          description: 'Comprehensive view of system data',
          headers: {
            type: 'Type',
            title: 'Title',
            priority: 'Priority',
            status: 'Status',
            date: 'Date'
          }
        }
      },
      user: {
        title: 'User Management',
        subtitle: 'Manage users, roles, and reporting lines',
        tabs: {
          users: 'Users',
          roles: 'Roles',
          reporting: 'Reporting Lines'
        },
        management: {
          title: 'User List',
          description: 'View and manage system users'
        },
        roles: {
          title: 'Role Management',
          description: 'Configure user roles and permissions',
          create: 'Create Role'
        },
        reporting: {
          title: 'Reporting Lines',
          description: 'Configure organizational reporting structure'
        },
        list: {
          name: 'Name',
          email: 'Email',
          role: 'Role',
          status: 'Status',
          fullName: 'Full Name',
          username: 'Username',
          reportsTo: 'Reports To',
          roles: 'Roles'
        },
        status: {
          active: 'Active',
          inactive: 'Inactive'
        },
        form: {
          fullName: 'Full Name',
          username: 'Username',
          email: 'Email',
          password: 'Password',
          isActive: 'Active Status',
          role: 'Role',
          manager: 'Manager',
          selectManager: 'Select Manager',
          selectRole: 'Select Role',
        },
        edit: {
          title: 'Edit User',
          description: 'Update user information and roles'
        },
        create: {
          title: 'Create User',
          description: 'Add a new user to the system'
        },
        delete: {
          title: 'Delete User',
          description: 'Are you sure you want to delete {{name}}? This action cannot be undone.'
        }
      },
      role: {
        create: {
          title: 'Create Role',
        },
        edit: {
          title: 'Edit Role',
          description: 'Update role information and permissions'
        },
        delete: {
          title: 'Delete Role',
          description: 'Are you sure you want to delete {{name}}? This action cannot be undone.'
        },
        form: {
          name: 'Role Name',
          description: 'Description',
          permissions: 'Permissions'
        },
        list: {
          name: 'Role Name',
          description: 'Description',
          permissions: 'Permissions',
          users: 'Users'
        },
        permission: {
          category: {
            USER: 'User',
            ROLE: 'Role',
            TICKET: 'Ticket',
            TICKET_TEMPLATE: 'Ticket Template',
            RESOURCE_TYPE: 'Resource Type',
            RESOURCE_ENTRY: 'Resource Entry'
          },
          operation: {
            READ: 'Read',
            CREATE: 'Create',
            UPDATE: 'Update',
            DELETE: 'Delete'
          },
          '*': 'All',
          'user.read': 'View Users',
          'user.create': 'Create Users',
          'user.update': 'Edit Users',
          'user.delete': 'Delete Users',
          'role.read': 'View Roles',
          'role.create': 'Create Roles',
          'role.update': 'Edit Roles',
          'role.delete': 'Delete Roles',
          'ticket.read': 'View Tickets',
          'ticket.create': 'Create Tickets',
          'ticket.update': 'Edit Tickets',
          'ticket.delete': 'Delete Tickets',
          'ticket_template.read': 'View Templates',
          'ticket_template.create': 'Create Templates',
          'ticket_template.update': 'Edit Templates',
          'ticket_template.delete': 'Delete Templates',
          'resource_type.read': 'View Resource Types',
          'resource_type.create': 'Create Resource Types',
          'resource_type.update': 'Edit Resource Types',
          'resource_type.delete': 'Delete Resource Types',
          'resource_entry.read': 'View Resource Entries',
          'resource_entry.create': 'Create Resource Entries',
          'resource_entry.update': 'Edit Resource Entries',
          'resource_entry.delete': 'Delete Resource Entries',
        }
      },
      profile: {
        title: 'Profile Settings',
        subtitle: 'Manage your account settings and preferences',
        personalInfo: {
          title: 'Personal Information',
          fullName: 'Full Name',
          username: 'Username'
        },
        contactInfo: {
          title: 'Contact Information',
          email: 'Email Address'
        },
        permissions: {
          title: 'Permissions',
          description: 'Your system permissions based on assigned roles'
        },
        avatar: {
          upload: 'Upload Avatar',
          crop: 'Crop Avatar Image',
          apply: 'Apply',
          cancel: 'Cancel'
        },
        password: {
          change: 'Change Password',
          current: 'Current Password',
          new: 'New Password',
          confirm: 'Confirm New Password',
          show: 'Show Password',
          hide: 'Hide Password'
        },
        actions: {
          update: 'Update Profile',
          logout: 'Logout'
        },
        messages: {
          updateSuccess: 'Profile updated successfully',
          updateError: 'Failed to update profile',
          avatarSuccess: 'Avatar cropped successfully. Click Update Profile to save changes.',
          avatarError: 'Failed to process cropped image',
          passwordSuccess: 'Password updated successfully',
          passwordError: {
            required: 'Current password is required',
            newRequired: 'New password is required',
            confirmRequired: 'Please confirm your new password',
            mismatch: 'New passwords do not match',
            incorrect: 'Current password is incorrect',
            invalid: 'Invalid password format',
            unauthorized: 'Not authorized to change password',
            notFound: 'User not found',
            serverError: 'Server error occurred',
            default: 'Failed to update password'
          }
        }
      },
      preferences: {
        title: 'Preferences',
        subtitle: 'Manage your account settings and preferences',
        saveChanges: 'Save Changes',
        interface: {
          title: 'Interface',
          description: 'Customize the look and feel of the application',
          theme: 'Theme',
          themeDescription: 'Choose your preferred color theme',
          selectTheme: 'Select theme',
          light: 'Light',
          dark: 'Dark',
          system: 'System'
        },
        notifications: {
          title: 'Notifications',
          description: 'Configure how you want to receive notifications',
          email: 'Email Notifications',
          emailDescription: 'Receive notifications via email',
          inApp: 'In-App Notifications',
          inAppDescription: 'Show notifications within the application',
          ticketUpdates: 'Ticket Updates',
          ticketUpdatesDescription: 'Get notified about changes to your tickets',
          systemAnnouncements: 'System Announcements',
          systemAnnouncementsDescription: 'Receive important system-wide announcements'
        },
        display: {
          title: 'Display',
          description: 'Customize how information is displayed',
          timezone: 'Timezone',
          timezoneDescription: 'Set your preferred timezone for dates and times',
          selectTimezone: 'Select timezone',
          autoTimezone: 'Auto (System)',
          localTimezone: 'Local',
          dateFormat: 'Date Format',
          dateFormatDescription: 'Choose your preferred time format',
          selectDateFormat: 'Select date format',
          twelveHour: '12-hour',
          twentyfourHour: '24-hour',
          numberFormat: 'Number Format',
          numberFormatDescription: 'Choose how numbers should be displayed',
          selectNumberFormat: 'Select number format',
          standardFormat: 'Standard',
          compactFormat: 'Compact'
        }
      },
      template: {
        title: 'Ticket Templates',
        workflowGraph: {
          toggle: 'Toggle Workflow Graph',
          hide: 'Hide Workflow Graph',
          show: 'Show Workflow Graph'
        },
        subtitle: 'Manage and create templates for different types of tickets',
        create: 'Create Template',
        noTemplates: 'No Templates Yet',
        noTemplatesDesc: 'Create your first template to streamline your ticket creation process',
        createFirst: 'Create First Template',
        workflowSteps: 'Workflow Steps',
        moreSteps: '{{count}} more steps',
        editTemplate: 'Edit Template',
        createNew: 'Create New Template',
        createNewDesc: 'Define the structure and workflow for your new ticket template',
        deleteConfirmation: 'Are you sure you want to delete "{{name}}" template?',
        tabs: {
          list: 'Templates',
          builder: 'Template Builder'
        },
        field: 'field',
        fields: 'fields',
        dependency: 'dependency',
        roles: 'roles',
        titleFormat: 'Title Format',
        created: 'Created',
        updated: 'Updated',
        assignableRoles: 'Assignable Roles',
        dependencies: 'Dependencies',
        dependencyDescription: 'Select steps that must be completed before this step',
        noDependencies: 'No dependencies',
        formFields: 'Form Fields',
        formPreview: 'Form Preview',
        fieldTypes: {
          text: 'Text',
          textarea: 'Text Area',
          select: 'Select',
          multiselect: 'Multi Select',
          checkbox: 'Checkbox',
          radio: 'Radio',
          date: 'Date',
          file: 'File Upload'
        },
        builder: {
          errors: {
            nameRequired: 'Template name is required',
            titleFormatRequired: 'Default title format is required',
            stepRequired: 'At least one step is required',
            stepNameRequired: 'Step name is required',
            stepDescriptionRequired: 'Step description is required',
            selectDependencies: 'Select dependencies',
            selectRoles: 'Select roles',
            selectChannels: 'Select channels'
          },
          placeholders: {
            templateName: 'Enter template name',
            selectPriority: 'Select priority',
            templateDescription: 'Enter template description',
            titleFormat: 'e.g., [Type] - {Summary}',
            stepName: 'Enter step name',
            stepDescription: 'Enter step description',
            selectDependencies: 'Select dependencies',
            selectRoles: 'Select roles',
            selectChannels: 'Select channels'
          },
          labels: {
            defaultPriority: 'Default Priority',
            description: 'Description',
            titleFormat: 'Title Format',
            workflow: 'Workflow',
            stepName: 'Step Name',
            formFields: 'Form Fields',
            dependencies: 'Dependencies',
            unnamedStep: 'Unnamed Step',
            workflowConfig: 'Workflow Configuration',
            parallelExecution: 'Parallel Execution',
            autoAssignment: 'Auto Assignment',
            notificationRules: 'Notification Rules',
            event: 'Event',
            notifyRoles: 'Notify Roles',
            channels: 'Channels',
            assignableRoles: 'Assignable Roles',
          },
          descriptions: {
            workflow: 'Define the steps in your ticket workflow',
            formFields: 'Add fields to collect information at this step',
            workflowConfig: 'Configure workflow settings',
          },
          priority: {
            low: 'Low',
            medium: 'Medium',
            high: 'High'
          },
          buttons: {
            addStep: 'Add Step',
            cancel: 'Cancel',
            update: 'Update Template',
            save: 'Save Template',
            addNotificationRule: 'Add Notification Rule',
          },
          events: {
            step_started: 'Step Started',
            step_completed: 'Step Completed',
            step_overdue: 'Step Overdue',
            step_skipped: 'Step Skipped',
            ticket_created: 'Ticket Created',
            ticket_assigned: 'Ticket Assigned',
            ticket_updated: 'Ticket Updated',
            ticket_completed: 'Ticket Completed',
          },
          channels: {
            email: 'Email',
            slack: 'Slack',
            webhook: 'Webhook',
            telegram: 'Telegram',
            sms: 'SMS',
            push: 'Push',
          },
          form: {
            errors: {
              labelRequired: 'Field label is required',
              optionsRequired: 'All options must have a value',
              requiredFieldLabel: 'Required field must have a label',
              nameRequired: 'Field name is required',
              nameInvalid: 'Field name can only contain {{allowedChars}}',
              nameDuplicate: 'Field name must be unique',
            },
            preview: 'Preview',
            dragAndDrop: 'Drag and drop form fields here',
            required: 'Required',
            sectionNamePlaceholder: 'Section Name (optional)',
            sectionName: 'Section Name',
            fieldLabel: 'Field Label',
            options: 'Options',
            option: 'Option',
            addOption: 'Add Option',
            templateName: 'Template Name',
            selectOption: 'Select {{field}}',
            dropFiles: 'Drop files here or click to upload',
            yes: 'Yes',
            placeholder: 'Placeholder text',
            helpText: 'Help text',
            validation: 'Validation',
            minLength: 'Minimum length',
            maxLength: 'Maximum length',
            minValue: 'Minimum value',
            maxValue: 'Maximum value',
            pattern: 'Pattern',
            validationMessage: 'Custom validation message',
          },
          workflow: {
            parallelExecution: 'Allow steps to be executed in parallel',
            autoAssignment: 'Enable automatic assignment based on roles',
            notificationRules: 'Notification Rules',
            addNotificationRule: 'Add Notification Rule',
            removeNotificationRule: 'Remove Rule'
          }
        }
      },
      resources: {
        title: 'Resource Management',
        subtitle: 'Manage and organize your resources',
        create: 'Create Resource',
        createNew: 'Create New Resource',
        createNewDesc: 'Define a new resource type with custom fields',
        createFirst: 'Create First Resource',
        noResources: 'No Resources',
        noResourcesDesc: 'Get started by creating your first resource type',
        tabs: {
          list: 'Resources',
          builder: 'Builder'
        },
        actions: {
          viewEntries: 'View Entries',
          addEntry: 'Add Entry',
          edit: 'Edit',
        },
        viewEntries: {
          title: '{{name}} Entries',
          description: 'View all entries for this resource type',
          noEntries: 'No entries found'
        },
        createType: {
          title: 'Create Resource Type',
          description: 'Define the structure of your new resource type'
        },
        createEntry: {
          title: 'Add {{name}} Entry',
          description: 'Create a new entry for this resource type'
        },
        form: {
          name: 'Name',
          namePlaceholder: 'Enter resource name...',
          description: 'Description',
          descriptionPlaceholder: 'Enter resource description...'
        },
        builder: {
          form: {
            resourceName: 'Resource Name',
            resourceType: 'Resource Type',
            selectResourceType: 'Select resource type',
          },
          labels: {
            description: 'Description',
            fields: 'Fields',
            version: 'Version',
          },
          descriptions: {
            fields: 'Define the structure of your resource'
          },
          placeholders: {
            resourceName: 'Enter resource name...',
            resourceDescription: 'Enter resource description...'
          },
          buttons: {
            cancel: 'Cancel',
            save: 'Save Resource',
            update: 'Update Resource'
          },
          errors: {
            nameRequired: 'Resource name is required',
            fieldsRequired: 'At least one field is required',
            fieldNameRequired: 'Field name is required',
            fieldLabelRequired: 'Field label is required',
            fieldTypeMissing: 'Field type is required',
            duplicateFieldName: 'Field name must be unique'
          }
        },
        search: {
          placeholder: 'Search entries...'
        },
      },
      ai: {
        assistant: "AI Assistant",
        inputPlaceholder: "Describe the ticket template you need...",
        newChat: "New Chat",
        send: "Send",
        error: "Sorry, an error occurred while processing your request. Please try again."
      }
    },
  },
  zh: {
    translation: {
      tickets: {
        ongoing: {
          title: '进行中的工单',
          description: '查看和管理进行中的工单',
          listTitle: '进行中工单列表',
          listDescription: '所有正在处理中的工单'
        },
        actions: {
          assign: '分配',
          complete: '完成',
          delete: '删除',
          close: '关闭',
          reopen: '重新打开',
          view: '查看'
        },
        closed: {
          title: '已关闭的工单',
          description: '查看已完成和归档的工单',
          listTitle: '已关闭工单列表',
          listDescription: '所有已完成和归档的工单'
        },
        create: {
          description: '使用模板创建新工单',
          selectTemplate: '选择模板',
          templatePlaceholder: '选择一个模板...',
          titlePlaceholder: '输入工单标题...'
        },
        list: {
          title: '标题',
          currentStep: '当前步骤',
          assignee: '负责人',
          priority: '优先级',
          status: '状态',
          lastUpdated: '最后更新',
          unassigned: '未分配',
          assignedTo: '已分配给 {{id}}',
          completionRate: '完成率',
          finalAssignee: '最终负责人',
        },
        priority: {
          low: '低',
          medium: '中',
          high: '高'
        },
        status: {
          ongoing: '进行中',
          completed: '已完成',
          closed: '已关闭',
          deleted: '已删除',
          archived: '已归档',
          pending: '待处理'
        },
        form: {
          required: '必填项',
          submit: '提交',
          description: '描述',
          saveDraft: '保存草稿',
        },
        assign: {
          title: '分配工单',
          description: '选择工单的负责人',
          confirmation: '将此工单分配给您？',
        }
      },
      common: {
        loading: '加载中...',
        error: '发生错误',
        save: '保存',
        cancel: '取消',
        delete: '删除',
        edit: '编辑',
        create: '创建',
        search: '搜索...',
        profile: '个人资料',
        userPreferences: '偏好设置',
        logout: '退出',
        confirmDelete: '确认删除',
        actionCannotBeUndone: '此操作无法撤销。',
        comingSoon: '即将推出',
        actions: '操作',
        submit: '提交',
        reset: '重置',
        apply: '应用',
        back: '返回',
        next: '下一步',
        finish: '完成',
        close: '关闭',
        view: '查看',
        refresh: '刷新',
        more: '更多',
        settings: '设置',
        help: '帮助',
        about: '关于',
        success: '成功',
        warning: '警告',
        info: '信息',
        confirm: '确认',
        required: '必填',
        optional: '可选',
        enabled: '已启用',
        disabled: '已禁用',
        status: '状态',
        details: '详情',
        filter: '筛选',
        sort: '排序',
        export: '导出',
        import: '导入',
        yes: '是',
        no: '否',
        unsavedChanges: '有未保存的更改',
        unsavedChangesDescription: '您有未保存的更改。是否要放弃？',
        discard: '放弃',
        expand: '展开',
        collapse: '收起',
        showing: '显示',
        of: '共',
        previousPage: '上一页',
        nextPage: '下一页',
        dragAndDropOrClick: '拖动并放置或点击上传',
        to: '至',
        entries: '项',
        page: '页',
      },
      components: {
        multiSelect: {
          search: '输入搜索...',
          selectAll: '全选',
          clear: '清除',
          close: '关闭',
          noResults: '未找到结果',
          selected: '已选择 {{count}} 项'
        }
      },
      auth: {
        login: {
          title: '登录',
          usernameLabel: '用户名',
          passwordLabel: '密码',
          submit: '登录',
          loggingIn: '登录中...',
          noAccount: '还没有账号？',
          registerLink: '注册'
        },
        register: {
          title: '创建账号',
          description: '请输入您的信息以创建账号',
          usernameLabel: '用户名',
          fullNameLabel: '姓名',
          emailLabel: '邮箱',
          passwordLabel: '密码',
          confirmPasswordLabel: '确认密码',
          submit: '注册',
          registering: '注册中...',
          haveAccount: '已有账号？',
          loginLink: '登录',
          passwordMismatch: '两次输入的密码不一致',
          error: '注册失败'
        },
        logout: '退出',
        email: '邮箱',
        password: '密码',
        errors: {
          connectionFailed: '无法连接到服务器',
          incorrectCredentials: '用户名或密码错误',
          accountLocked: '账户已锁定或禁用',
          userNotFound: '用户不存在',
          tooManyAttempts: '登录尝试次数过多，请稍后再试',
          serverError: '服务器错误，请稍后再试',
          defaultError: '登录过程中发生错误',
          fetchUserFailed: '获取用户信息失败',
          sessionExpired: '会话已过期，请重新登录',
          noRefreshToken: '无可用的刷新令牌'
        }
      },
      navigation: {
        overview: {
          title: '概览',
          insights: '洞察',
        },
        tickets: {
          title: '工单',
          newTicket: '新建工单',
          status: '状态',
          priority: '优先级',
          assignee: '负责人',
          description: '描述',
          opened: '进行中',
          closed: '已关闭',
          viewMode: {
            table: '表格视图',
            workflow: '工作流视图'
          }
        },
        management: {
          title: '管理',
          template: '模板',
          templateList: '模板列表',
          createTemplate: '创建模板',
          resource: '资源',
          users: '用户'
        }
      },
      insights: {
        title: '洞察',
        description: '了解您的工作流和资源使用情况',
        selectTimeRange: '选择时间范围',
        selectType: '选择类型',
        export: '导出数据',
        metrics: {
          totalTickets: '总工单数',
          averageResolutionTime: '平均解决时间',
          activeResources: '活跃资源',
          activeUsers: '活跃用户',
          days: '天'
        },
        type: {
          all: '所有数据',
          ticket: '工单',
          user: '用户',
          resource: '资源'
        },
        timeRange: {
          week: '最近7天',
          month: '最近30天',
          quarter: '最近90天',
          year: '最近365天'
        },
        charts: {
          ticketDistribution: '工单分布',
          ticketDistributionDesc: '按优先级的工单分布',
          resolutionTime: '解决时间',
          resolutionTimeDesc: '工单平均解决时间'
        },
        table: {
          title: '数据概览',
          description: '系统数据的综合视图',
          headers: {
            type: '类型',
            title: '标题',
            priority: '优先级',
            status: '状态',
            date: '日期'
          }
        }
      },
      user: {
        title: '用户管理',
        subtitle: '管理用户、角色和汇报线',
        tabs: {
          users: '用户',
          roles: '角色',
          reporting: '汇报线'
        },
        management: {
          title: '用户列表',
          description: '查看和管理系统用户'
        },
        roles: {
          title: '角色管理',
          description: '配置用户角色和权限',
          create: '创建角色'
        },
        reporting: {
          title: '汇报线',
          description: '配置组织报告结构'
        },
        list: {
          name: '姓名',
          email: '邮箱',
          role: '角色',
          status: '状态',
          fullName: '全名',
          username: '用户名',
          reportsTo: '汇报对象',
          roles: '角色'
        },
        status: {
          active: '活跃',
          inactive: '未激活'
        },
        form: {
          fullName: '全名',
          username: '用户名',
          email: '邮箱',
          password: '密码',
          isActive: '活跃状态',
          role: '角色',
          manager: '管理者',
          selectManager: '选择管理者',
          selectRole: '选择角色',
        },
        edit: {
          title: '编辑用户',
          description: '更新用户信息和角色'
        },
        create: {
          title: '创建用户',
          description: '添加新用户到系统'
        },
        delete: {
          title: '删除用户',
          description: '您确定要删除 {{name}} 吗？此操作无法撤销。'
        }
      },
      role: {
        create: {
          title: '创建角色',
        },
        edit: {
          title: '编辑角色',
          description: '更新角色信息和权限'
        },
        delete: {
          title: '删除角色',
          description: '您确定要删除 {{name}} 吗？此操作无法撤销。'
        },
        form: {
          name: '角色名称',
          description: '描述',
          permissions: '权限'
        },
        list: {
          name: '角色名称',
          description: '描述',
          permissions: '权限',
          users: '用户数'
        },
        permission: {
          category: {
            USER: '用户',
            ROLE: '角色',
            TICKET: '工单',
            TICKET_TEMPLATE: '工单模板',
            RESOURCE_TYPE: '资源类型',
            RESOURCE_ENTRY: '资源条目'
          },
          operation: {
            READ: '查看',
            CREATE: '创建',
            UPDATE: '编辑',
            DELETE: '删除'
          },
          '*': '所有',
          'user.read': '查看用户',
          'user.create': '创建用户',
          'user.update': '编辑用户',
          'user.delete': '删除用户',
          'role.read': '查看角色',
          'role.create': '创建角色',
          'role.update': '编辑角色',
          'role.delete': '删除角色',
          'ticket.read': '查看工单',
          'ticket.create': '创建工单',
          'ticket.update': '编辑工单',
          'ticket.delete': '删除工单',
          'ticket_template.read': '查看模板',
          'ticket_template.create': '创建模板',
          'ticket_template.update': '编辑模板',
          'ticket_template.delete': '删除模板',
          'resource_type.read': '查看资源类型',
          'resource_type.create': '创建资源类型',
          'resource_type.update': '编辑资源类型',
          'resource_type.delete': '删除资源类型',
          'resource_entry.read': '查看资源条目',
          'resource_entry.create': '创建资源条目',
          'resource_entry.update': '编辑资源条目',
          'resource_entry.delete': '删除资源条目',
        }
      },
      profile: {
        title: '个人资料',
        subtitle: '管理个人信息和密码',
        personalInfo: {
          title: '个人信息',
          fullName: '全名',
          username: '用户名',
        },
        contactInfo: {
          title: '联系信息',
          email: '邮箱',
        },
        permissions: {
          title: '权限',
          description: '查看您的权限'
        },
        avatar: {
          upload: '上传头像',
          crop: '裁剪头像',
          apply: '应用',
          cancel: '取消',
        },
        password: {
          change: '修改密码',
          current: '当前密码',
          new: '新密码',
          confirm: '确认新密码',
          show: '显示密码',
          hide: '隐藏密码'
        },
        actions: {
          update: '更新个人信息',
          logout: '退出'
        },
        messages: {
          updateSuccess: '个人信息已更新',
          updateError: '更新个人信息失败',
          avatarSuccess: '头像裁剪成功。单击更新个人信息以保存更改',
          avatarError: '头像上传失败',
          passwordSuccess: '密码已更新',
          passwordError: {
            required: '请输入当前密码',
            newRequired: '请输入新密码',
            confirmRequired: '请确认新密码',
            mismatch: '新密码不匹配',
            incorrect: '当前密码不正确',
            invalid: '无效的密码格式',
            unauthorized: '未授权更改密码',
            notFound: '用户未找到',
            serverError: '服务器错误',
            default: '更新密码失败'
          }
        }
      },
      preferences: {
        title: '偏好设置',
        subtitle: '自定义您的用户界面和通知',
        saveChanges: '保存更改',
        interface: {
          title: '用户界面',
          description: '自定义您的用户界面外观和感觉',
          theme: '主题',
          themeDescription: '选择您喜欢的色彩主题',
          selectTheme: '选择主题',
          light: '明亮',
          dark: '暗黑',
          system: '系统',
        },
        notifications: {
          title: '通知',
          description: '配置您的通知设置',
          email: '邮箱',
          emailDescription: '接收工单相关的通知',
          inApp: '应用内通知',
          inAppDescription: '在应用内显示通知',
          ticketUpdates: '工单更新',
          ticketUpdatesDescription: '获取工单更新的通知',
          systemAnnouncements: '系统公告',
          systemAnnouncementsDescription: '接收重要的系统公告'
        },
        display: {
          title: '显示',
          description: '自定义信息的显示方式',
          timezone: '时区',
          timezoneDescription: '设置您的首选时区以显示日期和时间',
          selectTimezone: '选择时区',
          autoTimezone: '自动 (系统)',
          localTimezone: '本地',
          dateFormat: '日期格式',
          dateFormatDescription: '选择您喜欢的时间格式',
          selectDateFormat: '选择日期格式',
          twelveHour: '12 小时制',
          twentyfourHour: '24 小时制',
          numberFormat: '数字格式',
          numberFormatDescription: '选择数字的显示方式',
          selectNumberFormat: '选择数字格式',
          standardFormat: '标准',
          compactFormat: '紧凑'
        }
      },
      template: {
        title: '工单模板',
        workflowGraph: {
          toggle: '切换工作流程图',
          hide: '隐藏工作流程图',
          show: '显示工作流程图'
        },
        subtitle: '管理和创建不同类型的工单模板',
        create: '创建模板',
        noTemplates: '暂无模板',
        noTemplatesDesc: '创建您的第一个模板以简化工单创建流程',
        createFirst: '创建第一个模板',
        workflowSteps: '工作流步骤',
        moreSteps: '还有 {{count}} 个步骤',
        editTemplate: '编辑模板',
        createNew: '创建新模板',
        createNewDesc: '为新的工单模板定义结构和工作流程',
        deleteConfirmation: '确定要删除 "{{name}}" 模板吗？',
        tabs: {
          list: '模板列表',
          builder: '模板构建器'
        },
        field: '字段',
        fields: '字段',
        dependency: '依赖',
        roles: '角色',
        titleFormat: '标题格式',
        created: '创建时间',
        updated: '更新时间',
        assignableRoles: '可分配角色',
        dependencies: '依赖项',
        dependencyDescription: '选择在此步骤之前必须完成的步骤',
        noDependencies: '无依赖项',
        formFields: '表单字段',
        formPreview: '表单预览',
        fieldTypes: {
          text: '文本',
          textarea: '文本区域',
          select: '下拉选择',
          multiselect: '多选',
          checkbox: '复选框',
          radio: '单选框',
          date: '日期',
          file: '文件上传'
        },
        builder: {
          errors: {
            nameRequired: '模板名称为必填项',
            titleFormatRequired: '默认标题格式为必填项',
            stepRequired: '至少需要一个步骤',
            stepNameRequired: '步骤名称为必填项',
            stepDescriptionRequired: '步骤描述为必填项',
            selectDependencies: '选择依赖项',
            selectRoles: '选择角色',
            selectChannels: '选择通知渠道'
          },
          placeholders: {
            templateName: '输入模板名称',
            selectPriority: '选择优先级',
            templateDescription: '输入模板描述',
            titleFormat: '例如：[类型] - {摘要}',
            stepName: '输入步骤名称',
            stepDescription: '输入步骤描述',
            selectDependencies: '选择依赖项',
            selectRoles: '选择角色',
            selectChannels: '选择通知渠道'
          },
          labels: {
            defaultPriority: '默认优先级',
            description: '描述',
            titleFormat: '标题格式',
            workflow: '工作流程',
            stepName: '步骤名称',
            formFields: '表单字段',
            dependencies: '依赖项',
            unnamedStep: '未命名步骤',
            workflowConfig: '工作流配置',
            parallelExecution: '并行执行',
            autoAssignment: '自动分配',
            notificationRules: '通知规则',
            event: '事件',
            notifyRoles: '通知角色',
            channels: '通知渠道',
            assignableRoles: '可分配角色',
          },
          descriptions: {
            workflow: '定义工单工作流程中的步骤',
            formFields: '添加字段以在此步骤收集信息',
            workflowConfig: '配置工作流设置'
          },
          priority: {
            low: '低',
            medium: '中',
            high: '高'
          },
          buttons: {
            addStep: '添加步骤',
            cancel: '取消',
            update: '更新模板',
            save: '保存模板',
            addNotificationRule: '添加通知规则',
          },
          events: {
            step_started: '步骤开始',
            step_completed: '步骤完成',
            step_overdue: '步骤超时',
            step_skipped: '步骤跳过',
            ticket_created: '工单创建',
            ticket_assigned: '工单分配',
            ticket_updated: '工单更新',
            ticket_completed: '工单完成',
          },
          channels: {
            email: '电子邮件',
            slack: 'Slack',
            webhook: 'Webhook',
            telegram: 'Telegram',
            sms: '短信',
            push: '推送通知',
          },
          form: {
            errors: {
              labelRequired: '字段标签为必填项',
              optionsRequired: '所有选项必须有值',
              requiredFieldLabel: '必填字段必须有标签',
              nameRequired: '字段名称为必填项',
              nameInvalid: '字段名称只能包含 {{allowedChars}}',
              nameDuplicate: '字段名称必须唯一'
            },
            preview: '预览',
            dragAndDrop: '拖放表单字段到这里',
            required: '必填',
            sectionNamePlaceholder: '区段名称（可选）',
            sectionName: '区段名称',
            fieldLabel: '字段标签',
            options: '选项',
            option: '选项',
            addOption: '添加选项',
            templateName: '模板名称',
            selectOption: '选择{{field}}',
            dropFiles: '拖放文件到这里或点击上传',
            yes: '是',
            placeholder: '占位文本',
            helpText: '帮助文本',
            validation: '验证',
            minLength: '最小长度',
            maxLength: '最大长度',
            minValue: '最小值',
            maxValue: '最大值',
            pattern: '模式',
            validationMessage: '自定义验证消息'
          },
          workflow: {
            parallelExecution: '允许步骤并行执行',
            autoAssignment: '根据角色启用自动分配',
            notificationRules: '通知规则',
            addNotificationRule: '添加通知规则',
            removeNotificationRule: '删除规则'
          }
        }
      },
      resources: {
        title: '资源管理',
        subtitle: '管理和组织您的资源',
        create: '创建资源',
        createNew: '创建新资源',
        createNewDesc: '定义新的资源类型和自定义字段',
        createFirst: '创建第一个资源',
        noResources: '暂无资源',
        noResourcesDesc: '创建您的第一个资源类型以开始使用',
        tabs: {
          list: '资源列表',
          builder: '构建器'
        },
        actions: {
          viewEntries: '查看条目',
          addEntry: '添加条目',
          edit: '编辑',
        },
        viewEntries: {
          title: '{{name}} 条目',
          description: '查看此资源类型的所有条目',
          noEntries: '暂无条目'
        },
        createType: {
          title: '创建资源类型',
          description: '定义新资源类型的结构'
        },
        createEntry: {
          title: '添加 {{name}} 条目',
          description: '为此资源类型创建新条目'
        },
        form: {
          name: '名称',
          namePlaceholder: '请输入资源名称...',
          description: '描述',
          descriptionPlaceholder: '请输入资源描述...'
        },
        builder: {
          form: {
            resourceName: '资源名称',
            resourceType: '资源类型',
            selectResourceType: '选择资源类型',
          },
          labels: {
            description: '描述',
            fields: '字段',
            version: '版本',
          },
          descriptions: {
            fields: '定义资源的结构'
          },
          placeholders: {
            resourceName: '请输入资源名称...',
            resourceDescription: '请输入资源描述...'
          },
          buttons: {
            cancel: '取消',
            save: '保存资源',
            update: '更新资源'
          },
          errors: {
            nameRequired: '资源名称为必填项',
            fieldsRequired: '至少需要一个字段',
            fieldNameRequired: '字段名称为必填项',
            fieldLabelRequired: '字段标签为必填项',
            fieldTypeMissing: '字段类型为必填项',
            duplicateFieldName: '字段名称必须唯一'
          },
        },
        search: {
          placeholder: '搜索条目...'
        },
      },
      ai: {
        assistant: "AI助手",
        inputPlaceholder: "描述您需要的工单模板...",
        newChat: "新对话",
        send: "发送",
        error: "抱歉，处理您的请求时出现错误。请重试。"
      }
    },
  },
};

  // Get the saved language preference from localStorage, default to 'en' if not found
  const savedLanguage = localStorage.getItem('preferredLanguage') || 'en';

  i18n
  .use(initReactI18next)
    .init({
      resources,
      lng: savedLanguage,
      fallbackLng: 'en',
      interpolation: {
        escapeValue: false,
      },
    });

  // Save language preference when it changes
  i18n.on('languageChanged', (lng) => {
    localStorage.setItem('preferredLanguage', lng);
  });

  export default i18n;
