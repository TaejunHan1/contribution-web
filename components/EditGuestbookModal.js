// components/EditGuestbookModal.js - 방명록 수정 모달
import React, { useState, useEffect } from 'react';
import styles from './GuestbookModal.module.css';

const EditGuestbookModal = ({ isOpen, onClose, message, eventData, onUpdate, onDelete }) => {
  const [formData, setFormData] = useState({
    guestName: '',
    messageContent: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  // 모달 열릴 때 기존 데이터로 초기화
  useEffect(() => {
    if (isOpen && message) {
      setFormData({
        guestName: message.from || '',
        messageContent: message.content || ''
      });
      setError('');
    }
  }, [isOpen, message]);

  // 모달 닫힐 때 초기화
  useEffect(() => {
    if (!isOpen) {
      setFormData({ guestName: '', messageContent: '' });
      setError('');
      setIsLoading(false);
    }
  }, [isOpen]);

  // 방명록 수정
  const handleUpdate = async () => {
    if (!formData.guestName.trim()) {
      setError('이름을 입력해주세요.');
      return;
    }
    if (!formData.messageContent.trim()) {
      setError('방명록 내용을 입력해주세요.');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const verifiedPhone = localStorage.getItem('verifiedPhone');
      if (!verifiedPhone) {
        setError('인증된 전화번호 정보가 없습니다.');
        return;
      }

      const response = await fetch('/api/update-guestbook', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id: message.id,
          guestName: formData.guestName.trim(),
          message: formData.messageContent.trim(),
          phone: verifiedPhone
        }),
      });

      const result = await response.json();

      if (result.success) {
        onUpdate();
        onClose();
      } else {
        setError(result.error || '방명록 수정에 실패했습니다.');
      }
    } catch (error) {
      console.error('방명록 수정 오류:', error);
      setError('방명록 수정에 실패했습니다. 다시 시도해주세요.');
    } finally {
      setIsLoading(false);
    }
  };

  // 방명록 삭제
  const handleDelete = async () => {
    if (!confirm('정말로 이 방명록을 삭제하시겠습니까?')) {
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const verifiedPhone = localStorage.getItem('verifiedPhone');
      if (!verifiedPhone) {
        setError('인증된 전화번호 정보가 없습니다.');
        return;
      }

      const response = await fetch('/api/delete-guestbook', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id: message.id,
          phone: verifiedPhone
        }),
      });

      const result = await response.json();

      if (result.success) {
        onDelete();
        onClose();
      } else {
        setError(result.error || '방명록 삭제에 실패했습니다.');
      }
    } catch (error) {
      console.error('방명록 삭제 오류:', error);
      setError('방명록 삭제에 실패했습니다. 다시 시도해주세요.');
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.header}>
          <h3 className={styles.title}>방명록 수정</h3>
          <button className={styles.closeButton} onClick={onClose}>×</button>
        </div>

        <div className={styles.content}>
          <div className={styles.inputGroup}>
            <label className={styles.label}>
              이름
            </label>
            <input
              type="text"
              className={styles.input}
              placeholder="이름을 입력해주세요"
              value={formData.guestName}
              onChange={(e) => setFormData({ ...formData, guestName: e.target.value })}
            />
          </div>

          <div className={styles.inputGroup}>
            <label className={styles.label}>
              {eventData?.bride_name || '하윤'}님과 {eventData?.groom_name || '민호'}님에게 전하는 마음
            </label>
            <textarea
              className={styles.textarea}
              placeholder="축하 메시지를 남겨주세요"
              value={formData.messageContent}
              onChange={(e) => setFormData({ ...formData, messageContent: e.target.value })}
              rows={6}
            />
          </div>

          {error && <p className={styles.error}>{error}</p>}

          <div className={styles.buttonGroup}>
            <button
              className={styles.secondaryButton}
              onClick={handleDelete}
              disabled={isLoading}
              style={{
                backgroundColor: '#fee2e2',
                color: '#dc2626',
                border: '1px solid #fecaca'
              }}
            >
              {isLoading ? '삭제 중...' : '삭제'}
            </button>
            <button
              className={styles.primaryButton}
              onClick={handleUpdate}
              disabled={isLoading || !formData.guestName.trim() || !formData.messageContent.trim()}
            >
              {isLoading ? (
                <>
                  <span className={styles.spinner}></span>
                  수정 중...
                </>
              ) : (
                '수정하기'
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditGuestbookModal;