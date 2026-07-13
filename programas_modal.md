Analisei as dependências e o componente `src/app/programas`.

## Bibliotecas relevantes encontradas

- **Angular 12.2.x**
- **ReactiveFormsModule** já importado em `src/app/app.module.ts`
- **PrimeNG 12.1.0** já usado no projeto, principalmente com `p-table` em `programas.component.html`
- **Bootstrap 4.6.0** com CSS e JS carregados no `angular.json`
- **jQuery** e **Popper.js** carregados por causa do Bootstrap JS
- **ngx-bootstrap 7.0.0** instalado, mas aparentemente não usado para modal no projeto
- **@angular/cdk** instalado, mas não há Angular Material/MatDialog configurado

## Situação atual do `ProgramasComponent`

O componente `src/app/programas/programas.component.ts` já usa **Reactive Forms** com `FormBuilder`:

```ts
this.selectVideoForm = this.formBuilder.group({
  canaisFormControl: [""],
  mimeTypeFormControl: [""],
  programaDeTvFormControl: [""],
  subProgramaDeTvFormControl: [""],
  prePosProgramaDeTvFormControl: [""],
  filtroDeBuscaFormControl: [""]
})
```

E o HTML já usa PrimeNG/Bootstrap:

```html
<p-table ...>
<input pInputText ...>
<select class="select form-control" ...>
```

Não encontrei nenhum padrão existente de modal no projeto: não há uso de `p-dialog`, `BsModalService`, `NgbModal`, `MatDialog` ou markup Bootstrap `.modal`.

## Melhor abordagem recomendada

A melhor forma, considerando o projeto atual, seria usar **PrimeNG Dialog (`p-dialog`) + Reactive Forms**.

Motivos:

1. **PrimeNG já está no projeto** e já é usado no próprio `ProgramasComponent` com `p-table`.
2. Evita controlar modal com **jQuery/Bootstrap JS**, que funciona, mas é menos idiomático em Angular.
3. Não exige instalar biblioteca nova.
4. Integra muito bem com `ReactiveFormsModule`, que já está importado.
5. Mantém o modal declarativo no template, com controle via variável booleana no componente.

## Mudanças necessárias para implementar

### 1. Importar `DialogModule` no `AppModule`

Arquivo: `src/app/app.module.ts`

```ts
import { DialogModule } from 'primeng/dialog';
```

E adicionar em `imports`:

```ts
DialogModule,
```

Opcionalmente, se quiser usar componentes PrimeNG para inputs/selects em vez de HTML nativo:

```ts
import { InputTextModule } from 'primeng/inputtext';
import { DropdownModule } from 'primeng/dropdown';
import { ButtonModule } from 'primeng/button';
```

Mas para ser menos invasivo, eu manteria os `<input>` e `<select>` nativos com Bootstrap.

### 2. Criar um formulário separado para o modal

No `ProgramasComponent`, eu criaria outro form, por exemplo:

```ts
programaModalForm = this.formBuilder.group({
  titulo: [''],
  canal: [''],
  tipo: [''],
  programaReferencia: ['']
});

exibirModalPrograma = false;
```

Ou, seguindo o estilo atual do arquivo, inicializar dentro do `constructor` junto do `selectVideoForm`.

### 3. Criar métodos para abrir, fechar e salvar

```ts
abrirModalPrograma(): void {
  this.programaModalForm.reset({
    titulo: '',
    canal: this.selectVideoForm.get('canaisFormControl').value || '',
    tipo: this.selectVideoForm.get('mimeTypeFormControl').value || '',
    programaReferencia: ''
  });

  this.exibirModalPrograma = true;
}

fecharModalPrograma(): void {
  this.exibirModalPrograma = false;
}

salvarProgramaModal(): void {
  const formValue = this.programaModalForm.value;

  // aqui entraria a chamada para o service, por exemplo:
  // this.mongodbService.createProgramaDeTv(formValue).subscribe(...)

  this.exibirModalPrograma = false;
}
```

### 4. Adicionar o botão de abertura no caption da tabela

No `programas.component.html`, perto dos botões atuais:

```html
<button
  style="margin: 0.3em 1em;"
  class="btn btn-success"
  type="button"
  (click)="abrirModalPrograma()">
  Novo Programa
</button>
```

### 5. Adicionar o `p-dialog` no template

Exemplo usando Bootstrap nos campos:

```html
<p-dialog
  header="Novo Programa"
  [(visible)]="exibirModalPrograma"
  [modal]="true"
  [style]="{ width: '500px' }"
  [draggable]="false"
  [resizable]="false">

  <form [formGroup]="programaModalForm">
    <div class="form-group">
      <label>Título</label>
      <input
        type="text"
        class="form-control"
        formControlName="titulo"
        placeholder="Digite o título" />
    </div>

    <div class="form-group">
      <label>Canal</label>
      <select class="form-control" formControlName="canal">
        <option value="">Selecione o canal</option>
        <option *ngFor="let canal of canais" [value]="canal.emissora">
          {{ canal.emissora }}
        </option>
      </select>
    </div>

    <div class="form-group">
      <label>Tipo</label>
      <select class="form-control" formControlName="tipo">
        <option value="">Selecione o tipo</option>
        <option *ngFor="let tipo of tiposDeVideo" [value]="tipo.titulo">
          {{ tipo.titulo }}
        </option>
      </select>
    </div>

    <div class="form-group">
      <label>Programa referência</label>
      <select class="form-control" formControlName="programaReferencia">
        <option value="">Selecione um programa</option>
        <option *ngFor="let programa of programaDeTvFiltered" [value]="programa.value">
          {{ programa.titulo }}
        </option>
      </select>
    </div>
  </form>

  <ng-template pTemplate="footer">
    <button type="button" class="btn btn-secondary" (click)="fecharModalPrograma()">
      Cancelar
    </button>
    <button type="button" class="btn btn-primary" (click)="salvarProgramaModal()">
      Salvar
    </button>
  </ng-template>
</p-dialog>
```

## Por que eu não escolheria Bootstrap Modal diretamente?

Apesar de Bootstrap estar carregado, usar modal Bootstrap 4 normalmente envolve `data-toggle`, `data-target` e comportamento via jQuery. Isso foge um pouco do padrão Angular e pode gerar problemas de estado, cleanup e testes.

## Por que eu não escolheria ngx-bootstrap?

`ngx-bootstrap` está instalado, mas não está configurado/importado para modal. Seria uma alternativa válida, porém adicionaria outro padrão visual/comportamental, enquanto o componente já está usando PrimeNG.

## Plano de implementação, se você quiser que eu faça

1. Adicionar `DialogModule` no `src/app/app.module.ts`.
2. Criar `programaModalForm` e `exibirModalPrograma` em `src/app/programas/programas.component.ts`.
3. Criar métodos `abrirModalPrograma`, `fecharModalPrograma` e `salvarProgramaModal`.
4. Inserir botão “Novo Programa” e o `<p-dialog>` em `src/app/programas/programas.component.html`.
5. Opcionalmente adicionar validações, como `Validators.required`, para título/canal/tipo.
6. Se o objetivo for realmente cadastrar no MongoDB, conectar `salvarProgramaModal()` ao método existente do `MongodbService`, como `createProgramaDeTv`, caso ele esteja disponível.

Se quiser, posso implementar essa estrutura no código. Para isso, **toggle to Act mode**.