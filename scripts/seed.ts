import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const sampleData = {
    administrative_metadata: {
        district: "Brahmanbaria",
        upazila_thana: "Sarail",
        union_paurashava: "Noagaon",
        ward_number: "3",
        voter_area_name: "Noagaon (Ward 3 Part)",
        voter_area_code: "0749",
        post_office: "Noagaon",
        post_code: "3430",
        total_voters: 2219,
        total_male_voters: 1148,
        publication_date: new Date("2023-10-01")
    },
    voter_records: [
        { sl_no: "0001", name: "Jurul Haque Mridha", voter_id: "120749285724", father: "Altaf Ali", mother: "Sufia Begum", occupation: "Farmer", dob: "27/08/1975", address: "Mridha Bari, Kazi Ura, Sarail, Brahmanbaria" },
        { sl_no: "0002", name: "Payel Hossain Mridha", voter_id: "120749285810", father: "Md. Ari Mia", mother: "Mst. Habiba Begum", occupation: "Unemployed", dob: "15/07/1987", address: "Kazi Ura, Sarail, Brahmanbaria" },
        { sl_no: "0003", name: "Ujjal Kha", voter_id: "120749285994", father: "Abul Badsha", mother: "Angura Begum", occupation: "Laborer", dob: "02/01/1984", address: "Ojir Khar Bari, Noagaon, Sarail, Brahmanbaria" },
        { sl_no: "0004", name: "Earab Kha", voter_id: "120749285995", father: "Abu Siddique Kha", mother: "Afia Khatun", occupation: "Farmer", dob: "15/06/1977", address: "Ojir Khar Bari, Noagaon, Sarail, Brahmanbaria" },
        { sl_no: "0005", name: "Ramjan Kha", voter_id: "120749285996", father: "Abu Siddique Kha", mother: "Afia Khatun", occupation: "Daily Laborer", dob: "10/01/1967", address: "Ojir Khar Bari, Noagaon, Sarail, Brahmanbaria" },
        { sl_no: "0006", name: "Maula Kha", voter_id: "120749285997", father: "Siraj Ali Kha", mother: "Noor Jahan", occupation: "Daily Laborer", dob: "20/03/1980", address: "Ojir Khar Bari, Noagaon, Sarail, Brahmanbaria" },
        { sl_no: "0007", name: "Zakir Hossain", voter_id: "120749285998", father: "Abu Taher", mother: "Firuza Begum", occupation: "Daily Laborer", dob: "07/11/1983", address: "Bakshalir Bari, Noagaon, Sarail, Brahmanbaria" },
        { sl_no: "0008", name: "Aktar Hossain", voter_id: "120749285999", father: "Lodon Mia", mother: "Momtaz Begum", occupation: "Daily Laborer", dob: "15/05/1988", address: "Bakshalir Bari, Noagaon, Sarail, Brahmanbaria" },
        { sl_no: "0009", name: "Mahmudur Rahman Selukas", voter_id: "120749286000", father: "Md. Zillur Rahman", mother: "Halima Begum", occupation: "Business", dob: "01/10/1966", address: "Hafez Saheber Bari, Noagaon, Sarail, Brahmanbaria" },
        { sl_no: "0010", name: "Md. Somel Mia", voter_id: "120749286001", father: "Edayet Ullah", mother: "Rupiya Begum", occupation: "Student", dob: "06/10/1982", address: "Hafez Saheber Bari, Noagaon, Sarail, Brahmanbaria" },
        { sl_no: "0011", name: "Masud Mia", voter_id: "120749286002", father: "Nayeb Ullah", mother: "Saleha Begum", occupation: "Unemployed", dob: "05/06/1981", address: "Hafez Saheber Bari, Noagaon, Sarail, Brahmanbaria" },
        { sl_no: "0012", name: "Md. Hedayet Ullah", voter_id: "120749286004", father: "Mohidur Rahman", mother: "Amena Begum", occupation: "Government Service", dob: "31/12/1954", address: "Hafez Saheber Bari, Noagaon, Sarail, Brahmanbaria" },
        { sl_no: "0013", name: "Ahemdur Rahman Binkas", voter_id: "120749286006", father: "Md. Zillur Rahman", mother: "Halima Begum", occupation: "Teacher", dob: "16/09/1969", address: "Hafez Saheber Bari, Noagaon, Sarail, Brahmanbaria" },
        { sl_no: "0014", name: "Md. Sharif Mia", voter_id: "120749286009", father: "Md. Habibur Rahman", mother: "Mst. Khodeja Begum", occupation: "Student", dob: "28/11/1985", address: "Hafez Saheber Bari, Noagaon, Sarail, Brahmanbaria" },
        { sl_no: "0015", name: "Md. Mehedi Hasan", voter_id: "120749286011", father: "Md. Anwar Hossain", mother: "Mst. Rabeya Begum", occupation: "Unemployed", dob: "06/03/1986", address: "Hafez Saheber Bari, Noagaon, Sarail, Brahmanbaria" },
        { sl_no: "0016", name: "Deleted Voter", voter_id: "120749286012", father: "N/A", mother: "N/A", occupation: "N/A", dob: "01/01/1970", address: "N/A", status: "Deleted" },
        { sl_no: "0017", name: "Md. Arafat Mia", voter_id: "120749286014", father: "Md. Anwar Hossain", mother: "Mst. Rabeya Begum", occupation: "Business", dob: "07/01/1987", address: "Hafez Saheber Bari, Noagaon, Sarail, Brahmanbaria" },
        { sl_no: "0018", name: "Deleted Voter", voter_id: "120749286015", father: "N/A", mother: "N/A", occupation: "N/A", dob: "01/01/1970", address: "N/A", status: "Deleted" },
        { sl_no: "0019", name: "Md. Mamun Mia", voter_id: "120749286017", father: "Md. Nayeb Ullah", mother: "Mst. Saleha Begum", occupation: "Driver", dob: "04/01/1977", address: "Hafez Saheber Bari, Noagaon, Sarail, Brahmanbaria" },
        { sl_no: "0020", name: "Md. Mizan Mia", voter_id: "120749286020", father: "Md. Sabur Ullah", mother: "Momena Khatun", occupation: "Farmer", dob: "11/03/1975", address: "Hafez Saheber Bari, Noagaon, Sarail, Brahmanbaria" },
        { sl_no: "0021", name: "Md. Azizul Islam", voter_id: "120749286022", father: "Habib Ullah", mother: "Halima Begum", occupation: "Farmer", dob: "03/04/1957", address: "Hafez Saheber Bari, Noagaon, Sarail, Brahmanbaria" },
        { sl_no: "0022", name: "Md. Lenshu Mia", voter_id: "120749286028", father: "Abul Bashar", mother: "Anwara Begum", occupation: "Unemployed", dob: "11/03/1972", address: "Hafez Saheber Bari, Noagaon, Sarail, Brahmanbaria" },
        { sl_no: "0023", name: "Md. Ashraf Ali", voter_id: "120749286031", father: "Md. Elias Mia", mother: "Monwara Begum", occupation: "N/A", dob: "01/03/1982", address: "Hafez Saheber Bari, Brahmanbaria" },
        { sl_no: "0024", name: "Md. Shahadat Ullah", voter_id: "120749286033", father: "Md. Shahid Ullah", mother: "Mst. Sayera Khatun", occupation: "Student", dob: "31/12/1985", address: "Hafez Saheber Bari, Noagaon, Sarail, Brahmanbaria" },
        { sl_no: "0025", name: "Md. Shahid Ullah", voter_id: "120749286034", father: "Rahim Ullah", mother: "Obaydunnessa", occupation: "Unemployed", dob: "04/04/1932", address: "Hafez Saheber Bari, Noagaon, Sarail, Brahmanbaria" },
        { sl_no: "0026", name: "Md. Mosharraf Hossain", voter_id: "120749286037", father: "Md. Shahidullah Mia", mother: "Mst. Chayera Begum", occupation: "Private Service", dob: "16/06/1969", address: "Hafez Saheber Bari, Noagaon, Sarail, Brahmanbaria" },
        { sl_no: "0027", name: "Zulkar Nain", voter_id: "120749286038", father: "Md. Emdad Ullah Mia", mother: "Khaleda Begum", occupation: "Private Service", dob: "11/03/1964", address: "Hafez Saheber Bari, Noagaon, Sarail, Brahmanbaria" },
        { sl_no: "0028", name: "Md. Aman Ullah", voter_id: "120749286039", father: "Abdur Razzaq", mother: "Hazera Begum", occupation: "Business", dob: "10/09/1967", address: "Hafez Saheber Bari, Noagaon, Sarail, Brahmanbaria" },
        { sl_no: "0029", name: "Md. Tofazzal Haque", voter_id: "120749286044", father: "Md. Nurul Haque", mother: "Mst. Peyara Khatun", occupation: "Business", dob: "21/04/1983", address: "Hafez Saheber Bari, Noagaon, Sarail, Brahmanbaria" },
        { sl_no: "0030", name: "Md. Chalek Mia", voter_id: "120749286045", father: "Ahid Ullah", mother: "Setara Begum", occupation: "Farmer", dob: "21/02/1942", address: "Hafez Saheber Bari, Noagaon, Sarail, Brahmanbaria" },
        { sl_no: "0031", name: "Md. Wasel Mia", voter_id: "120749286048", father: "Md. Chalek Mia", mother: "Mst. Rezia Begum", occupation: "Business", dob: "17/04/1985", address: "Hafez Saheber Bari, Noagaon, Sarail, Brahmanbaria" },
        { sl_no: "0032", name: "Enayet Ullah", voter_id: "120749286049", father: "Md. Edayet Ullah", mother: "Mst. Rufiya Begum", occupation: "Business", dob: "05/04/1974", address: "Hafez Saheber Bari, Noagaon, Sarail, Brahmanbaria" },
        { sl_no: "0033", name: "Md. Edayet Ullah", voter_id: "120749286050", father: "Golam Rahman", mother: "Mirshir Ma", occupation: "Farmer", dob: "26/03/1941", address: "Hafez Saheber Bari, Noagaon, Sarail, Brahmanbaria" },
        { sl_no: "0034", name: "Md. Rahat Ullah", voter_id: "120749286052", father: "Ahid Ullah", mother: "Setara Begum", occupation: "Private Service", dob: "16/11/1972", address: "Hafez Saheber Bari, Noagaon, Sarail, Brahmanbaria" },
        { sl_no: "0035", name: "Md. Nurul Haque", voter_id: "120749286058", father: "Shamsul Haque", mother: "Feskare Ma", occupation: "Business", dob: "28/01/1947", address: "Hafez Saheber Bari, Noagaon, Sarail, Brahmanbaria" },
        { sl_no: "0036", name: "Md. Fazlul Haque", voter_id: "120749286060", father: "Sirajul Haque", mother: "Nannu Begum", occupation: "Farmer", dob: "17/02/1960", address: "Hafez Saheber Bari, Noagaon, Sarail, Brahmanbaria" },
        { sl_no: "0037", name: "Md. Imranul Haque", voter_id: "120749286061", father: "Md. Fazlul Haque", mother: "Mst. Sumi Begum", occupation: "Farmer", dob: "13/02/1988", address: "Hafez Saheber Bari, Noagaon, Sarail, Brahmanbaria" },
        { sl_no: "0038", name: "Md. Manu Mia", voter_id: "120749286064", father: "Sirajul Haque", mother: "Nannu Begum", occupation: "Farmer", dob: "11/02/1957", address: "Hafez Saheber Bari, Noagaon, Sarail, Brahmanbaria" },
        { sl_no: "0039", name: "Md. Milan Mia", voter_id: "120749286070", father: "Md. Sabur Ullah", mother: "Momena", occupation: "Farmer", dob: "13/02/1967", address: "Hafez Saheber Bari, Noagaon, Sarail, Brahmanbaria" },
        { sl_no: "0040", name: "Md. Iqbal Mia", voter_id: "120749286071", father: "Yakur Mia", mother: "Ohida Begum", occupation: "Farmer", dob: "02/01/1967", address: "Hafez Saheber Bari, Noagaon, Sarail, Brahmanbaria" },
        { sl_no: "0041", name: "Md. Dulal Mia Khondokar", voter_id: "120749286072", father: "Suruj Mia", mother: "Golesha Begum", occupation: "Laborer", dob: "02/03/1959", address: "Hafez Saheber Bari, Noagaon, Sarail, Brahmanbaria" },
        { sl_no: "0042", name: "Md. Khasru Mia", voter_id: "120749286074", father: "Md. Shahid Ullah", mother: "Mst. Sayera Khatun", occupation: "Business", dob: "07/01/1977", address: "Hafez Saheber Bari, Noagaon, Sarail, Brahmanbaria" },
        { sl_no: "0043", name: "Md. Tayyab Ali", voter_id: "120749286078", father: "Eskandar", mother: "Rabeya Khatun", occupation: "Private Service", dob: "07/02/1967", address: "Hafez Saheber Bari, Noagaon, Sarail, Brahmanbaria" },
        { sl_no: "0044", name: "Md. Azharul Islam", voter_id: "120749286086", father: "Dana Mia", mother: "Amena Begum", occupation: "Private Service", dob: "21/06/1981", address: "Hafez Saheber Bari, Noagaon, Sarail, Brahmanbaria" },
        { sl_no: "0045", name: "Shafiqul Islam", voter_id: "120749286088", father: "Abu Taher", mother: "Aheda Begum", occupation: "Farmer", dob: "17/03/1962", address: "Hafez Saheber Bari, Noagaon, Sarail, Brahmanbaria" },
        { sl_no: "0046", name: "Atikul Islam", voter_id: "120749286089", father: "Md. Sabur Ullah", mother: "Momena Khatun", occupation: "Farmer", dob: "01/01/1977", address: "Hafez Saheber Bari, Noagaon, Sarail, Brahmanbaria" },
        { sl_no: "0047", name: "Mohammad Tarikul Islam", voter_id: "120749286096", father: "Mohammad Nur Ahmad", mother: "Lal Banu", occupation: "Private Service", dob: "30/09/1967", address: "Elai Neyazer Bari, Noagaon, Sarail, Brahmanbaria" },
        { sl_no: "0048", name: "Khizir Mia", voter_id: "120749286098", father: "Ful Badsha", mother: "Alladi Begum", occupation: "Farmer", dob: "11/02/1972", address: "Jarulla Hati Pashchim, Noagaon, Sarail, Brahmanbaria" },
        { sl_no: "0049", name: "Md. Abu Bakkar", voter_id: "120749286099", father: "A. Hekim", mother: "Mst. Safiya Begum", occupation: "Driver", dob: "12/06/1980", address: "Elai Neyazer Bari, Noagaon, Sarail, Brahmanbaria" },
        { sl_no: "0050", name: "Abu Taj Mia", voter_id: "120749286102", father: "Mohammad Nur Ahmad", mother: "Babur Ma", occupation: "Farmer", dob: "02/01/1962", address: "Elai Neyazer Bari, Noagaon, Sarail, Brahmanbaria" },
        { sl_no: "1148", name: "Md. Mostak Mia", voter_id: "120749287712", father: "Mazi-dul Mia", mother: "Yasmin Begum", occupation: "Mechanic", dob: "20/07/2000", address: "Noagaon" }
    ]
};

function parseDate(dateStr: string): Date {
    const [day, month, year] = dateStr.split('/');
    return new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
}

async function seed() {
    try {
        console.log('Starting database seed...');

        // Clear existing data
        await prisma.voter.deleteMany({});
        await prisma.voterArea.deleteMany({});
        console.log('Cleared existing data');

        // Create voter area
        const area = await prisma.voterArea.create({
            data: sampleData.administrative_metadata
        });
        console.log('Created voter area:', area.voter_area_name);

        // Create voters
        const votersToCreate = sampleData.voter_records.map(v => ({
            ...v,
            dob: parseDate(v.dob),
            voter_area_code: sampleData.administrative_metadata.voter_area_code,
            status: v.status || 'Active'
        }));

        await prisma.voter.createMany({
            data: votersToCreate
        });
        console.log(`Created ${votersToCreate.length} voters`);

        console.log('\nSeed completed successfully!');
    } catch (error) {
        console.error('Seed error:', error);
        throw error;
    } finally {
        await prisma.$disconnect();
    }
}

seed()
    .then(() => process.exit(0))
    .catch(() => process.exit(1));
