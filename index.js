const express = require('express');
const axios = require('axios');
const ExcelJS = require('exceljs');

const app = express();
const port = 3000;
const path = require('path');

app.set('view engine', 'ejs');

app.use(express.static(path.join(__dirname, 'public')));

app.get('/', async (req, res) => {
    res.render('index', {searchQuery: req.query.kode_pend});
});

app.get('/download', async (req, res) => {
    try {
        const apiUrl = 'https://api-sscasn.bkn.go.id/2024/portal/spf?kode_ref_pend='+req.query.kode_pend+'&offset=';
        var offset = 0
        const url = apiUrl+offset

        const response = await axios.get(url, {
            headers: {
                'Origin': 'https://sscasn.bkn.go.id'
            }
        });

        const data = JSON.parse(JSON.stringify(response.data.data))
        console.log("🚀 ~ app.get ~ data:", data.data)
        // console.log("🚀 ~ app.get ~ data.length:", data.data.length)
        if(data.data && data.data.length > 0){
            const totalData = data.meta.total
            
            const workbook = new ExcelJS.Workbook();
            const worksheet = workbook.addWorksheet('Data-Casn'+req.query.kode_pend);
    
            worksheet.columns = [
                { header: 'Nama Instansi', key: 'ins_nm', width: 40 },
                { header: 'Formasi', key: 'formasi_nm', width: 25 },
                { header: 'Jabatan', key: 'jabatan_nm', width: 55 },
                { header: 'Lokasi', key: 'lokasi_nm', width: 150 },
                { header: 'Jumlah Formasi', key: 'jumlah_formasi', width: 10 },
                { header: 'Gaji Minimal', key: 'gaji_min', width: 15, style: { numFmt: 'Rp #,##0' } },
                { header: 'Gaji Maximal', key: 'gaji_max', width: 15, style: { numFmt: 'Rp #,##0' } },
            ];
    
            worksheet.getRow(1).font = { bold: true, size: 16 };
    
            for(let i=0; i<=totalData; i+=10){
                var dynamicUrl = apiUrl+i
                const response = await axios.get(dynamicUrl, {
                    headers: {
                        'Origin': 'https://sscasn.bkn.go.id'
                    }
                });
    
                const data = JSON.parse(JSON.stringify(response.data.data.data)) || []
    
                if(data.length > 0){
                    for(let j=0; j<data.length; j++){
                        worksheet.addRow({
                            ins_nm: data[j].ins_nm,
                            formasi_nm: data[j].formasi_nm,
                            jabatan_nm: data[j].jabatan_nm,
                            lokasi_nm: data[j].lokasi_nm,
                            jumlah_formasi: data[j].jumlah_formasi,
                            gaji_min: data[j].gaji_min,
                            gaji_max: data[j].gaji_max
                        });
                    }
                }
    
                console.log('Success Get Data-Casn-Pendidikan-'+req.query.kode_pend+'-Page-'+(i/10+1))
            }
    
            res.setHeader(
                'Content-Type',
                'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
            );
            res.setHeader(
                'Content-Disposition',
                'attachment; filename=' + 'Data-Casn-'+req.query.kode_pend+'.xlsx'
            );
    
            await workbook.xlsx.write(res);
            return res.end();
        }

        return res.status(404).json({ message: 'No Data' });

    } catch (error) {
        console.error('Error fetching data:', error);
        res.status(500).json({ message: 'Error fetching data' });
    }
});

// Start server
app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
});
