import React from 'react';
import {
  Modal as RNModal,
  View,
  Text,
  StyleSheet,
  TouchableWithoutFeedback,
} from 'react-native';
import { Colors } from '../../constants/colors';

interface ModalProps {
  visible: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  dismissable?: boolean;
}

export function Modal({
  visible,
  onClose,
  title,
  children,
  dismissable = true,
}: ModalProps) {
  return (
    <RNModal
      visible={visible}
      transparent
      animationType="fade"
      statusBarTranslucent
      onRequestClose={dismissable ? onClose : undefined}
    >
      <TouchableWithoutFeedback onPress={dismissable ? onClose : undefined}>
        <View style={styles.overlay}>
          <TouchableWithoutFeedback>
            <View style={styles.content}>
              <View style={styles.handle} />
              {title && <Text style={styles.title}>{title}</Text>}
              {children}
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </RNModal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: Colors.overlay,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  content: {
    backgroundColor: Colors.surface,
    borderRadius: 24,
    padding: 24,
    width: '100%',
    maxWidth: 400,
    borderWidth: 1,
    borderColor: Colors.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.15,
    shadowRadius: 24,
    elevation: 16,
  },
  handle: {
    width: 40,
    height: 4,
    backgroundColor: Colors.border,
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: 16,
  },
  title: {
    color: Colors.text,
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 16,
    textAlign: 'center',
  },
});
