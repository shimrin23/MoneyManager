import { useState, useRef } from 'react';
import { apiClient } from '../api/client';
import '../styles/FinancialPages.css';

interface SriLankanBank {
    id: string;
    name: string;
    code: 'combank' | 'hnb' | 'sampath' | 'boc' | 'peoples' | 'frimi' | 'generic';
    tag: string;
    color: string;
    guide: string;
}

const SRI_LANKAN_BANKS: SriLankanBank[] = [
    {
        id: 'combank',
        name: 'Commercial Bank of Ceylon',
        code: 'combank',
        tag: 'ComBank Online / Q+',
        color: '#00529b',
        guide: 'Log in to ComBank Online -> Accounts -> Statement -> Download as CSV/Excel.',
    },
    {
        id: 'hnb',
        name: 'Hatton National Bank',
        code: 'hnb',
        tag: 'HNB Online',
        color: '#f58220',
        guide: 'Log in to HNB Digital Banking -> Select Account -> Export Transactions (.csv).',
    },
    {
        id: 'sampath',
        name: 'Sampath Bank',
        code: 'sampath',
        tag: 'Sampath Vishwa',
        color: '#ff6600',
        guide: 'Log in to Sampath Vishwa -> Accounts -> History -> Export Statement.',
    },
    {
        id: 'boc',
        name: 'Bank of Ceylon',
        code: 'boc',
        tag: 'BOC Online',
        color: '#d4af37',
        guide: 'Log in to BOC Internet Banking -> Statements -> Download CSV.',
    },
    {
        id: 'peoples',
        name: "People's Bank",
        code: 'peoples',
        tag: "People's Wave",
        color: '#8b0000',
        guide: "Log in to People's Wave / Net -> Account Details -> Export Statement.",
    },
    {
        id: 'frimi',
        name: 'FriMi / Nations Trust Bank',
        code: 'frimi',
        tag: 'FriMi App',
        color: '#e60050',
        guide: 'Open FriMi app -> Profile / History -> Request & export CSV Statement.',
    },
];

export const ConnectBankPage = () => {
    // Statement Import State
    const [selectedBank, setSelectedBank] = useState<SriLankanBank>(SRI_LANKAN_BANKS[0]);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [fileContent, setFileContent] = useState<string>('');
    const [uploading, setUploading] = useState(false);
    const [importSuccess, setImportSuccess] = useState<{
        totalParsed: number;
        inserted: number;
        skippedDuplicates: number;
    } | null>(null);
    const [errorMsg, setErrorMsg] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setErrorMsg(null);
        setImportSuccess(null);
        const file = e.target.files?.[0];
        if (!file) return;

        if (!file.name.endsWith('.csv') && !file.name.endsWith('.txt')) {
            setErrorMsg('Please upload a valid .csv bank statement file.');
            return;
        }

        setSelectedFile(file);
        const reader = new FileReader();
        reader.onload = (event) => {
            const text = event.target?.result as string;
            setFileContent(text);
        };
        reader.readAsText(file);
    };

    const handleImportStatement = async () => {
        if (!fileContent) {
            setErrorMsg('Please select a bank statement CSV file first.');
            return;
        }

        setUploading(true);
        setErrorMsg(null);
        try {
            const resp = await apiClient.post('/transactions/import-statement', {
                csvContent: fileContent,
                bankType: selectedBank.code,
            });

            if (resp.data?.success) {
                setImportSuccess(resp.data.summary);
                setSelectedFile(null);
                setFileContent('');
                if (fileInputRef.current) fileInputRef.current.value = '';
            }
        } catch (err: any) {
            console.error('Import error', err);
            setErrorMsg(
                err.response?.data?.error ||
                'Could not process bank statement. Please verify the CSV format.'
            );
        } finally {
            setUploading(false);
        }
    };

    // Sample statement generator for quick user testing
    const loadSampleStatement = () => {
        const sampleCSV = `Date,Description,Withdrawal (Debit),Deposit (Credit),Balance
01/10/2024,SALARY DEPOSIT - TECH CORP,,150000.00,150000.00
02/10/2024,KEELLS SUPER COLOMBO 03,4250.00,,145750.00
03/10/2024,DIALOG AXIATA BILL PAYMENT,2500.00,,143250.00
04/10/2024,UBER LANKA TRIP RIDE,1200.00,,142050.00
05/10/2024,LANKA IOC FUEL SHED,5000.00,,137050.00
06/10/2024,CEB ELECTRICITY BILL,3800.00,,133250.00
07/10/2024,DARAZ ONLINE PURCHASE,4990.00,,128260.00`;

        setFileContent(sampleCSV);
        setSelectedFile(new File([sampleCSV], 'sample_combank_statement.csv', { type: 'text/csv' }));
        setErrorMsg(null);
        setImportSuccess(null);
    };

    return (
        <div className="page-container connect-bank-page">
            <div className="page-header" style={{ marginBottom: '1.5rem' }}>
                <h1 className="page-title">Connect Sri Lankan Bank</h1>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'minmax(300px, 1fr) 1.2fr', gap: '1.5rem' }}>
                {/* Bank Selection List */}
                <div className="card" style={{ padding: '1.25rem' }}>
                    <h3 style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: '1rem', color: '#1e293b' }}>
                        1. Select Your Bank
                    </h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                        {SRI_LANKAN_BANKS.map((b) => {
                            const isSelected = selectedBank.id === b.id;
                            return (
                                <div
                                    key={b.id}
                                    onClick={() => setSelectedBank(b)}
                                    style={{
                                        padding: '0.85rem 1rem',
                                        borderRadius: '8px',
                                        border: isSelected ? '2px solid #2563eb' : '1px solid #e2e8f0',
                                        backgroundColor: isSelected ? '#eff6ff' : '#ffffff',
                                        cursor: 'pointer',
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        alignItems: 'center',
                                        transition: 'all 0.15s ease',
                                    }}
                                >
                                    <div>
                                        <div style={{ fontWeight: 600, color: '#1e293b', fontSize: '0.95rem' }}>
                                            {b.name}
                                        </div>
                                        <div style={{ fontSize: '0.8rem', color: '#64748b' }}>
                                            {b.tag}
                                        </div>
                                    </div>
                                    {isSelected && (
                                        <span style={{ color: '#2563eb', fontWeight: 700, fontSize: '1.1rem' }}>✓</span>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Statement Upload & Preview */}
                <div className="card" style={{ padding: '1.25rem' }}>
                    <h3 style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: '0.5rem', color: '#1e293b' }}>
                        2. Upload Statement for {selectedBank.name}
                    </h3>
                    <p style={{ fontSize: '0.85rem', color: '#64748b', marginBottom: '1rem' }}>
                        {selectedBank.guide}
                    </p>

                    {/* Drop Zone */}
                    <div
                        style={{
                            border: '2px dashed #cbd5e1',
                            borderRadius: '12px',
                            padding: '2rem 1.5rem',
                            textAlign: 'center',
                            backgroundColor: '#f8fafc',
                            marginBottom: '1.2rem',
                            cursor: 'pointer',
                        }}
                        onClick={() => fileInputRef.current?.click()}
                    >
                        <input
                            ref={fileInputRef}
                            type="file"
                            accept=".csv,.txt"
                            style={{ display: 'none' }}
                            onChange={handleFileChange}
                        />
                        <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>📄</div>
                        <div style={{ fontWeight: 600, color: '#334155', marginBottom: '0.25rem' }}>
                            {selectedFile ? selectedFile.name : 'Click to upload or drag & drop CSV'}
                        </div>
                        <div style={{ fontSize: '0.8rem', color: '#94a3b8' }}>
                            Supports Commercial Bank, HNB, Sampath, BOC, FriMi & generic CSV statements
                        </div>
                    </div>

                    {/* Action buttons */}
                    <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', alignItems: 'center' }}>
                        <button
                            className="primary"
                            onClick={handleImportStatement}
                            disabled={!fileContent || uploading}
                            style={{
                                padding: '0.65rem 1.5rem',
                                borderRadius: '8px',
                                fontWeight: 600,
                                background: '#2563eb',
                                color: '#ffffff',
                                border: 'none',
                                cursor: fileContent && !uploading ? 'pointer' : 'not-allowed',
                                opacity: fileContent && !uploading ? 1 : 0.6,
                            }}
                        >
                            {uploading ? 'Processing Statement…' : 'Import Statement'}
                        </button>

                        <button
                            type="button"
                            onClick={loadSampleStatement}
                            style={{
                                padding: '0.65rem 1rem',
                                borderRadius: '8px',
                                fontWeight: 500,
                                fontSize: '0.85rem',
                                background: '#f1f5f9',
                                color: '#334155',
                                border: '1px solid #cbd5e1',
                                cursor: 'pointer',
                            }}
                        >
                            Load Sample ComBank CSV
                        </button>
                    </div>

                    {/* Error Alert */}
                    {errorMsg && (
                        <div style={{ marginTop: '1rem', padding: '0.75rem 1rem', borderRadius: '8px', backgroundColor: '#fee2e2', color: '#991b1b', fontSize: '0.875rem' }}>
                            {errorMsg}
                        </div>
                    )}

                    {/* Success Result */}
                    {importSuccess && (
                        <div style={{ marginTop: '1rem', padding: '1rem', borderRadius: '8px', backgroundColor: '#f0fdf4', border: '1px solid #bbf7d0' }}>
                            <h4 style={{ color: '#166534', fontWeight: 600, margin: '0 0 0.5rem 0' }}>
                                ✓ Statement Imported Successfully!
                            </h4>
                            <ul style={{ margin: 0, paddingLeft: '1.25rem', color: '#15803d', fontSize: '0.875rem' }}>
                                <li>Parsed transactions: <strong>{importSuccess.totalParsed}</strong></li>
                                <li>Added to your account: <strong>{importSuccess.inserted}</strong></li>
                                <li>Skipped duplicate records: <strong>{importSuccess.skippedDuplicates}</strong></li>
                            </ul>
                            <p style={{ margin: '0.75rem 0 0 0', fontSize: '0.85rem', color: '#166534' }}>
                                Your Dashboard, Transactions, and Spending Trends have now been refreshed with this data.
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ConnectBankPage;
