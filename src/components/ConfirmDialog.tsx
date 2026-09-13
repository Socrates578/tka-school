import { useTranslation } from 'react-i18next'
import Modal from './Modal'

export default function ConfirmDialog({ onConfirm, onCancel }: { onConfirm: () => void; onCancel: () => void }) {
  const { t } = useTranslation()
  return (
    <Modal
      title={t('common.confirmDeleteTitle')}
      onClose={onCancel}
      width={420}
      footer={<>
        <button className="btn btn-ghost" onClick={onCancel}>{t('common.cancel')}</button>
        <button className="btn btn-danger" onClick={onConfirm}>{t('common.yesDelete')}</button>
      </>}
    >
      <p style={{ color: 'var(--text-secondary)', fontSize: 14 }}>{t('common.confirmDeleteBody')}</p>
    </Modal>
  )
}
