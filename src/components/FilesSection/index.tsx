import Button from '../Button';
import CloudUploadOutlinedIcon from '@mui/icons-material/CloudUploadOutlined';
import styles from './FilesSection.module.css';
import Table from '../GenericTable';
import { Column } from '@/types/Table';

const dataMock: any = [
  { name: 'ExtratoDetalhado.csv', inclusionDate: '10 Ago 2025 10:00:00', size: '4.2 MB' },
  { name: 'Extrato_2.xlsx', inclusionDate: '10 Ago 2025 10:00:00', size: '21 KB' },
];

const columns: Column<(typeof dataMock)[0]>[] = [
  { key: 'name', label: 'NOME', align: 'left' },
  { key: 'inclusionDate', label: 'DATA DE INCLUSÃO', align: 'left' },
  { key: 'size', label: 'TAMANHO', align: 'left' },
];

export default function FilesSection() {
  return (
    <section className={styles.filesContainer}>
      <div className={styles.uploadSection}>
        <strong>Arquivos (2)</strong>
        <p className={styles.filesText}>
          Os arquivos em anexo serão usados para a geração de vínculos com os investigados.
        </p>
        <Button
          className={styles.uploadButton}
          data-testid="upload-file-button"
          icon={<CloudUploadOutlinedIcon />}
          variant="contained"
          label="Upload"
          onClick={() => console.log('')}
        />
      </div>

      <div className={styles.tableSection}>
        <Table columns={columns} data={dataMock} loading={false} />
      </div>
    </section>
  );
}
