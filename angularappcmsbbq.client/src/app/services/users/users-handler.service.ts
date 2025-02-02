import { Injectable, ViewChild } from '@angular/core';
import { UsersService } from './users.service';
import { Router } from '@angular/router';
import { SnackBarService } from '../snack-bar.service';
import { MatTableDataSource } from '@angular/material/table';
import { ApplicationUser } from '../../models/applicationUser';
import { MatSort } from '@angular/material/sort';
import { MatPaginator } from '@angular/material/paginator';
import { FormControl, FormGroup } from '@angular/forms';
import { TaskResult } from '../../models/taskResult';
import { GuidGenerator } from '../guid-generator';
import { RegisterViewModel } from '../../models/registerViewModel';
import { InfoService } from '../InfoService';

@Injectable({
  providedIn: 'root'
})
export class UsersHandlerService {

  constructor(
    public usersService: UsersService,
    private snackBarService: SnackBarService
  ) {
  }

  displayedColumns: string[] = ['lp', 'imie', 'nazwisko', 'telefon', 'email', 'roleId', 'action'];
  dataSource = new MatTableDataSource<ApplicationUser>();

  @ViewChild(MatSort) sort !: MatSort;
  @ViewChild(MatPaginator) paginator !: MatPaginator;

  private usersMap: Map<string, string> = new Map<string, string>();

  searchFormControl = new FormControl('');

  user!: ApplicationUser;
  users: ApplicationUser[] = [];
  formGroup!: FormGroup;
  loadingElements: boolean = false;


  searchResultInformationStyle: any = {
    'display': 'none'
  }


  firstPositionStyle: any = {
    'display': 'none',
    'font-size': '30px',
    'border': '30px solid orange'
  }

  preloaderStyle: any = {
    'display': 'flex',
    'justify-content': 'center',
    'alignalign-items': 'center',
  }

  public initializeDataSource(paginator: MatPaginator, sort: MatSort): void {
    this.dataSource.paginator = paginator;
    this.dataSource.sort = sort;

    this.getAll();

    // czyszczenie kontrolki wyszukującej po odświeżeniu strony z wpisanego tekstu
    if (this.searchFormControl.dirty) {
      this.dataSource.filter = '';
      this.searchFormControl.setValue('');
    }

    this.searchResultInformationStyle.display = 'none';

  }


  // Pobiera wszystkich użytkowników z bazy
  public getAll(): void {
    this.usersService.getAll().subscribe({
      next: ((result: TaskResult<ApplicationUser[]>) => {
        if (result.success) {
          // pobranie danych
          this.dataSource.data = result.model as ApplicationUser[];
          this.users = result.model as ApplicationUser[];

          this.users.forEach((f: ApplicationUser) => {
            this.usersMap.set(f.id, f.email);
          });

          if (this.users.length > 0) {
            this.firstPositionStyle.display = 'none';
          } else {             
            this.firstPositionStyle.display = 'block';
          }

          this.preloaderStyle.display = 'none';

        } else {
          this.snackBarService.setSnackBar(`Dane nie zostały załadowane. ${result.message}`);
        }
        return result;
      }),
      error: (error: Error) => {
        this.snackBarService.setSnackBar(`Brak połączenia z bazą danych or token time expired. ${InfoService.info('UsersHandlerService', 'getAll')}. Name: ${error.name}. Message: ${error.message}`);
      }
    });
  }


   
  public getUserByEmail(email: string): ApplicationUser {
    this.usersService.getUserByEmail(email).subscribe({
      next: ((result: TaskResult<ApplicationUser>) => {
        if (result.success) {
          this.user = result.model as ApplicationUser;
        } else {
          this.snackBarService.setSnackBar(`Użytkownik nie został załadowany. ${result.message}`);
        }
        return result;
      }),
      error: (error: Error) => {
        this.snackBarService.setSnackBar(`Brak połączenia z bazą danych or token time expired. ${InfoService.info('UsersHandlerService', 'getUserByEmail')}. Name: ${error.name}. Message: ${error.message}`);
      }
    });

    return this.user;
  }




  public getUserByIdViaUsersMap(userId: string): string {
    let result = '';
    if (userId.length > 0) {
      let userEmail = this.usersMap.get(userId);
      if (userEmail) {
        result = userEmail;
      }
    }
    return result;
  }



  public create (form: FormGroup): void {

    let email = form.controls['emailRegister'].value;
    let password = form.controls['passwordRegister'].value;

    let imie = form.controls['imie'].value;
    let nazwisko = form.controls['nazwisko'].value;
    let ulica = form.controls['ulica'].value;
    let numerUlicy = form.controls['numerUlicy'].value;
    let miejscowosc = form.controls['miejscowosc'].value;
    let kodPocztowy = form.controls['kodPocztowy'].value;
    let kraj = form.controls['kraj'].value;
    let dataUrodzenia = form.controls['dataUrodzenia'].value;
    let telefon = form.controls['telefon'].value;
    let roleName = form.controls['roleName'].value;


    let registerViewModel: RegisterViewModel = {
      userId: GuidGenerator.newGuid().toString(),

      email: email,
      password: password,

      imie: imie,
      nazwisko: nazwisko,
      ulica: ulica,
      numerUlicy: numerUlicy,
      miejscowosc: miejscowosc,
      kodPocztowy: kodPocztowy,
      kraj: kraj,
      dataUrodzenia: dataUrodzenia.toISOString().split('T')[0],
      telefon: telefon,
      roleName: roleName
    };


    this.loadingElements = true;
    this.usersService.create (registerViewModel).subscribe({
      next: ((result: TaskResult<RegisterViewModel>) => {
        if (result.success) {
          this.snackBarService.setSnackBar('Zarejestrowano nowego użytkownika');
          this.loadingElements = false;
          form.reset();
          form.markAllAsTouched();
        } else {
          this.snackBarService.setSnackBar(`Uzytkownik nie został zarejestrowany. ${result.message}`);
          this.loadingElements = false;
        }
        return result;
      }),
      error: (error: Error) => {
        this.snackBarService.setSnackBar(`Brak połączenia z bazą danych or token time expired. ${InfoService.info('UsersHandlerService', 'create')}. Name: ${error.name}. Message: ${error.message}`);
        this.loadingElements = false;
      }
    }); 
  }
    


  public edit (id: string, form: FormGroup): void {

    let email = form.controls['email'].value;
    let imie = form.controls['imie'].value;
    let nazwisko = form.controls['nazwisko'].value;
    let ulica = form.controls['ulica'].value;
    let numerUlicy = form.controls['numerUlicy'].value;
    let miejscowosc = form.controls['miejscowosc'].value;
    let kodPocztowy = form.controls['kodPocztowy'].value;
    let kraj = form.controls['kraj'].value;
    let dataUrodzenia = form.controls['dataUrodzenia'].value;
    let telefon = form.controls['telefon'].value;
    let roleId = form.controls['roleId'].value;

    let user: ApplicationUser = {
      id: id,
      email: email,
      imie: imie,
      nazwisko: nazwisko,
      ulica: ulica,
      numerUlicy: numerUlicy,
      miejscowosc: miejscowosc,
      kodPocztowy: kodPocztowy,
      kraj: kraj,
      dataUrodzenia: dataUrodzenia,
      telefon: telefon,
      roleId: roleId
    };

    this.loadingElements = true;
    this.usersService.edit(id, user).subscribe({
      next: ((result: TaskResult<ApplicationUser>) => {
        if (result.success) {
          this.snackBarService.setSnackBar(`Konto zostało zaktualizowane`);
          this.loadingElements = false;
        } else {
          this.snackBarService.setSnackBar(`Konto nie zostało zaktualizowane. ${result.message}`);
          this.loadingElements = false;
        }

        return result;
      }),
      error: (error: Error) => {
        this.snackBarService.setSnackBar(`Brak połączenia z bazą danych or token time expired. ${InfoService.info('UsersHandlerService', 'edit')}. Name: ${error.name}. Message: ${error.message}`);
        this.loadingElements = false;
      }
    });
  }






  public delete(id: string): void {
    this.loadingElements = true;
    this.usersService.delete(id).subscribe({
      next: ((result: TaskResult<boolean>) => {
        if (result.success) {
          this.getAll ();
          this.snackBarService.setSnackBar(`Usunięto`);
          this.loadingElements = false;
        } else {
          this.snackBarService.setSnackBar(`Dane nie zostały załadowane. ${result.message}`);
          this.loadingElements = false;
        }
        return result;
      }),
      error: (error: Error) => {
        this.snackBarService.setSnackBar(`Brak połączenia z bazą danych or token time expired. ${InfoService.info('UsersHandlerService', 'delete')}. Name: ${error.name}. Message: ${error.message}`);
        this.loadingElements = false;
      }
    });
  }


  


  public searchFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();

    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }

    if (this.users.length > 0 && this.dataSource.filteredData.length == 0) {
      this.searchResultInformationStyle.display = 'block';
    } else {
      this.searchResultInformationStyle.display = 'none';
    }

  }





  public isValidCreate(form: FormGroup): boolean {
    if (
      form.controls['emailRegister'].touched && form.controls['emailRegister'].dirty && form.controls['emailRegister'].valid &&
      form.controls['passwordRegister'].touched && form.controls['passwordRegister'].dirty && form.controls['passwordRegister'].valid &&
      form.controls['imie'].touched && form.controls['imie'].dirty && form.controls['imie'].valid &&
      form.controls['nazwisko'].touched && form.controls['nazwisko'].dirty && form.controls['nazwisko'].valid &&
      form.controls['ulica'].touched && form.controls['ulica'].dirty && form.controls['ulica'].valid &&
      form.controls['numerUlicy'].touched && form.controls['numerUlicy'].dirty && form.controls['numerUlicy'].valid &&
      form.controls['miejscowosc'].touched && form.controls['miejscowosc'].dirty && form.controls['miejscowosc'].valid &&
      form.controls['kodPocztowy'].touched && form.controls['kodPocztowy'].dirty && form.controls['kodPocztowy'].valid &&
      form.controls['kraj'].touched && form.controls['kraj'].dirty && form.controls['kraj'].valid &&
      form.controls['dataUrodzenia'].touched && form.controls['dataUrodzenia'].dirty && form.controls['dataUrodzenia'].valid &&
      form.controls['telefon'].touched && form.controls['telefon'].dirty && form.controls['telefon'].valid &&
      form.controls['roleName'].touched && form.controls['roleName'].dirty && form.controls['roleName'].valid
    ) {
      return false;
    }
    else {
      return true;
    }
  }

   


  public isValidEdit(form: FormGroup): boolean {
    if (
      form.controls['imie'].valid &&
      form.controls['nazwisko'].valid &&
      form.controls['telefon'].valid &&
      form.controls['ulica'].valid &&
      form.controls['numerUlicy'].valid &&
      form.controls['miejscowosc'].valid &&
      form.controls['kraj'].valid &&
      form.controls['kodPocztowy'].valid &&
      form.controls['dataUrodzenia'].valid &&
      form.controls['roleId'].valid
    ) {
      return false;
    }
    else {
      return true;
    }
  }
    


}
