// Create this as a new file: components/CancelOrderModal.jsx

import React, { useState } from 'react';
import { 
  View, 
  Text, 
  Modal, 
  TouchableOpacity, 
  TextInput, 
  StyleSheet, 
  ActivityIndicator,
  ScrollView 
} from 'react-native';

const CancelOrderModal = ({ visible, onClose, orderId, onSuccess }) => {
  const [selectedReason, setSelectedReason] = useState('');
  const [customReason, setCustomReason] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const cancelReasons = [
    'Changed my mind',
    'Found a better price elsewhere',
    'Ordered by mistake',
    'Delivery taking too long',
    'Need to change shipping address',
    'Payment issues',
    'Other'
  ];

  const handleCancel = async () => {
    if (!selectedReason) {
      setError('Please select a reason for cancellation');
      return;
    }

    if (selectedReason === 'Other' && !customReason.trim()) {
      setError('Please provide a reason for cancellation');
      return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      const apiUrl = process.env.EXPO_API_ORDERS_URL || 'http://192.168.1.2:3000/api/orders';
      const reason = selectedReason === 'Other' ? customReason : selectedReason;

      const response = await fetch(`${apiUrl}/${orderId}/cancel`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ reason }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to cancel order');
      }

      onSuccess();
      handleClose();
    } catch (err) {
      setError(err.message || 'Failed to cancel order. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setSelectedReason('');
    setCustomReason('');
    setError('');
    onClose();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={handleClose}
    >
      <View style={styles.overlay}>
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Cancel Order</Text>
            <TouchableOpacity 
              onPress={handleClose} 
              style={styles.closeButton}
              disabled={isSubmitting}
            >
              <Text style={styles.closeButtonText}>✕</Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalContent} showsVerticalScrollIndicator={false}>
            <Text style={styles.modalDescription}>
              Are you sure you want to cancel this order? This action cannot be undone.
            </Text>

            <Text style={styles.sectionTitle}>Reason for cancellation:</Text>

            {cancelReasons.map((reason) => (
              <TouchableOpacity
                key={reason}
                style={[
                  styles.reasonOption,
                  selectedReason === reason && styles.reasonOptionSelected
                ]}
                onPress={() => setSelectedReason(reason)}
                disabled={isSubmitting}
              >
                <View style={styles.radioButton}>
                  {selectedReason === reason && <View style={styles.radioButtonInner} />}
                </View>
                <Text style={[
                  styles.reasonText,
                  selectedReason === reason && styles.reasonTextSelected
                ]}>
                  {reason}
                </Text>
              </TouchableOpacity>
            ))}

            {selectedReason === 'Other' && (
              <TextInput
                style={styles.textInput}
                placeholder="Please specify your reason..."
                value={customReason}
                onChangeText={setCustomReason}
                multiline
                numberOfLines={3}
                textAlignVertical="top"
                editable={!isSubmitting}
              />
            )}

            {error && (
              <View style={styles.errorContainer}>
                <Text style={styles.errorText}>{error}</Text>
              </View>
            )}
          </ScrollView>

          <View style={styles.modalFooter}>
            <TouchableOpacity
              style={[styles.button, styles.cancelButton]}
              onPress={handleClose}
              disabled={isSubmitting}
            >
              <Text style={styles.cancelButtonText}>Keep Order</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.button, styles.confirmButton]}
              onPress={handleCancel}
              disabled={isSubmitting || !selectedReason}
            >
              {isSubmitting ? (
                <ActivityIndicator color="#fff" size="small" />
              ) : (
                <Text style={styles.confirmButtonText}>Cancel Order</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContainer: {
    backgroundColor: '#fff',
    borderRadius: 16,
    width: '100%',
    maxWidth: 500,
    maxHeight: '80%',
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 12,
    elevation: 5,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1a1a1a',
  },
  closeButton: {
    padding: 4,
  },
  closeButtonText: {
    fontSize: 24,
    color: '#666',
    fontWeight: '300',
  },
  modalContent: {
    padding: 20,
  },
  modalDescription: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 12,
  },
  reasonOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    backgroundColor: '#f8f9fa',
    borderRadius: 10,
    marginBottom: 10,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  reasonOptionSelected: {
    backgroundColor: '#fff',
    borderColor: '#000',
  },
  radioButton: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#ddd',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  radioButtonInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#000',
  },
  reasonText: {
    fontSize: 14,
    color: '#666',
    flex: 1,
  },
  reasonTextSelected: {
    color: '#1a1a1a',
    fontWeight: '600',
  },
  textInput: {
    backgroundColor: '#f8f9fa',
    borderRadius: 10,
    padding: 12,
    fontSize: 14,
    color: '#1a1a1a',
    marginTop: 10,
    minHeight: 80,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  errorContainer: {
    backgroundColor: '#fee',
    padding: 12,
    borderRadius: 8,
    marginTop: 12,
  },
  errorText: {
    fontSize: 13,
    color: '#e74c3c',
    textAlign: 'center',
  },
  modalFooter: {
    flexDirection: 'row',
    padding: 20,
    gap: 12,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  button: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelButton: {
    backgroundColor: '#f8f9fa',
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  cancelButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#666',
  },
  confirmButton: {
    backgroundColor: '#e74c3c',
  },
  confirmButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#fff',
  },
});

export default CancelOrderModal;