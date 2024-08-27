const express = require('express');
const axios = require('axios');
const ExcelJS = require('exceljs');

const app = express();
const port = 3000;

// Route to get data from another API
app.get('/scrapping-casn-formation', async (req, res) => {
    try {
        const pendidikan = req.query.pendidikan
        const apiUrl = 'https://api-sscasn.bkn.go.id/2024/portal/spf?kode_ref_pend='+pendidikan+'&offset='; // Replace with the actual API URL
        var offset = 0
        const url = apiUrl+offset

        const response = await axios.get(url, {
            headers: {
                'Origin': 'https://sscasn.bkn.go.id'
            }
        });

        const data = JSON.parse(JSON.stringify(response.data.data))

        const totalData = data.meta.total
        
        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet('Data-Casn');

        worksheet.columns = [
            { header: 'Nama Instansi', key: 'ins_nm', width: 40 },
            { header: 'JP', key: 'jp_nama', width: 10 },
            { header: 'Formasi', key: 'formasi_nm', width: 25 },
            { header: 'Jabatan', key: 'jabatan_nm', width: 55 },
            { header: 'Lokasi', key: 'lokasi_nm', width: 150 },
            { header: 'Jumlah Formasi', key: 'jumlah_formasi', width: 10 },
            { header: 'Gaji Minimal', key: 'gaji_min', width: 15 },
            { header: 'Gaji Maximal', key: 'gaji_max', width: 15 },
        ];

        worksheet.getRow(1).font = { bold: true, size: 16 };

        for(let i=0; i<=totalData; i+=10){
            var dynamicUrl = apiUrl+i
            const response = await axios.get(dynamicUrl, {
                headers: {
                    'Origin': 'https://sscasn.bkn.go.id'
                }
            });

            const data = JSON.parse(JSON.stringify(response.data.data.data))

            for(let j=0; j<data.length; j++){
                worksheet.addRow({
                    ins_nm: data[j].ins_nm,
                    JP: data[j].jp_nama,
                    formasi_nm: data[j].formasi_nm,
                    jabatan_nm: data[j].jabatan_nm,
                    lokasi_nm: data[j].lokasi_nm,
                    jumlah_formasi: data[j].jumlah_formasi,
                    gaji_min: data[j].gaji_min,
                    gaji_max: data[j].gaji_max
                });
            }

            console.log('Success Get Data-Casn-Pendidikan-'+pendidikan+'-Page-'+(i/10+1))
        }

        // Set the response headers to force download the Excel file
        res.setHeader(
            'Content-Type',
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
        );
        res.setHeader(
            'Content-Disposition',
            'attachment; filename=' + 'Data-Casn.xlsx'
        );

        // Write the workbook to the response stream
        await workbook.xlsx.write(res);
        res.end();

    } catch (error) {
        console.error('Error fetching data:', error);
        res.status(500).json({ message: 'Error fetching data' });
    }
});

// Start server
app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
});
