import { BlobInfo, BlobTagItem } from './interface';
// import { FilterMode } from '../../utils/utils';

class StorageService {
    private baseURL = `${process.env.VUE_APP_API_GETWAY}/remote/v1/storage`;
    async uploadFile(token: string, formData: FormData): Promise<BlobInfo>{
        const result = await fetch(this.baseURL,{
            method:"POST",
            headers:{
                'Authorization': 'Bearer ' + token
            },
            body:formData
        });
        return result.json();
    }
    // async getFiles(token: string, schoolId: string, classId: string, groupId: string, studentId: string, date: string,filterMode: number):Promise<Array<BlobTagItem>> {
        // let URL = `${this.baseURL}?classId=${classId}&groupId=${groupId}&studentId=${studentId}`;
        // if(filterMode === FilterMode.Session){
        //     URL = `${this.baseURL}?schoolId=${schoolId}&groupId=${groupId}`;
        // }
        // const result = await fetch(URL, {
        //     method: "GET",
        //     headers: {
        //         'Authorization': 'Bearer ' + token
        //     },
        // });
        // return result.json();
    // }
    async removeFile(token: string, fileName: string): Promise<boolean> {
        const result = await fetch(`${this.baseURL}/${fileName}`, {
            method: "DELETE",
            headers: {
                'Authorization': 'Bearer ' + token
            },
        });
        return result.json();
    }
}
export const StudentStorageService = new StorageService();