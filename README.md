## Docker build USING docker-compose
...
docker-compose build (If the app is not already deployed on Docker)
docker-compose up

...

## Docker Build WITHOUT using docker-compose
```
docker build --tag angular-video-server .
docker run -p 1991:1991 angular-video-server
```

## Test
Open `http://localhost/` in your browser.


## Etapas para mudar todas as referencias do que se chama hoje de bloco mas na verdade deve ser ProgramaMontado

## Exemplo
### Antes - nomenclatura usando o termo Bloco
```                
<div class="dozeHoras">
    <div class="atracao" [style]="getStyleBloco(programa.tempoTotalEmSegundos,dia,i)"
        *ngFor="let programa of listaCanal[dia+'Bloco']; index as i"
        (click)="getInfoProgramaMontado(programa,dia,i)">
        <p style="padding:0;white-space: nowrap; overflow: hidden;">{{programa.tituloAtracao}}</p>
        <p style="padding:0;">{{programa.horarioDeExibicao}}</p>
        <span>{{programa.tempoTotal}}</span>
    </div>
</div>
```
### Depois - nomenclatura usando o termo ProgramaMontado
```
<div class="dozeHoras">
    <div class="atracao" [style]="getStyleProgramaMontado(programa.tempoTotalEmSegundos,dia,i)"
        *ngFor="let programa of listaCanal[dia+'ProgramaMontado']; index as i"
        (click)="getInfoProgramaMontado(programa,dia,i)">
        <p style="padding:0;white-space: nowrap; overflow: hidden;">{{programa.tituloAtracao}}</p>
        <p style="padding:0;">{{programa.horarioDeExibicao}}</p>
        <span>{{programa.tempoTotal}}</span>
    </div>
</div>
```
### ETAPAS
- Rename getStyleBloco para getStyleProgramaMontado
- No template, o "programa" o "let programa of listaCanal..." foi alterado para "programaMontado"
- No Schema CanaisSchema do mongodbNodeServer, os termos ...Bloco associado aos dias da semana, exemplo segundaBloco fou alterado para ...ProgramaMontado. Exemplo segundaBlocoMontado
- Na base de dados, na collection "Canais", todos os termos como "segundaBloco" foram renomeados para "segundaProgramaMontado", usando um replace no JSON exportado, deletando toda a collection e subindo uma nova de mesmo nome com as mudancas importadas com o JSON alterado.
- No template, a linha
```
*ngFor="let programaMontado of listaCanal[dia+'Bloco']; index as i"
```
foi alterada para 
```
*ngFor="let programaMontado of listaCanal[dia+'ProgramaMontado']; index as i"
```
- Mudanca na intercace Canais. ex segundaBloco para segundaProgramaMontato
- Type DiaDaSemanaBloco alterado para DiaDaSemanaProgramaMontado assim como todos os itens parte od type que tinham o termo Bloco. Type substituido tambem na logica do component. 
- Valores da variavel listaDeNomesDosDiasDaSemana alterados.
- Nome da variavel listaDeNomesDosDiasDaSemanaSemBlocos alterado para listaDeNomesDosDiasDaSemanaSemProgramaMontado
- Funcao gerarListasDeBlocos renomeada para gerarListasDeProgramasMontados e todos os termos associados a bloco renomeados para programaMontado, incluindo a referencia a mudanca feita a collection canais.
- Funcao getInfoBlocoAtracao renomear apara getInfoProgramaMontado
- Funcao clickAtracaoFromBloco renomeada para clickBlocoFromProgramaMontado
- Termos usados no metodo removePrograma renomeados