declare module 'react-native-ios-context-menu' {
  import { ComponentType } from 'react';
  import { ViewProps } from 'react-native';

  export interface ContextMenuViewProps extends ViewProps {
    onPressMenuItem?: (event: { nativeEvent: { actionKey: string } }) => void;
    menuConfig?: {
      menuTitle?: string;
      menuItems: {
        actionKey: string;
        actionTitle: string;
        menuAttributes?: string[];
        icon?: {
          type: string;
          imageValue: {
            systemName?: string;
          };
        };
      }[];
    };
  }

  export const ContextMenuView: ComponentType<ContextMenuViewProps>;
} 