/**
 * Selective schools across the UK: state grammar schools (England and
 * Northern Ireland) and well-known independent schools (all four nations).
 * Not an official ranking. Entry details change every year, so the app always
 * sends people to the school's own admissions page to check.
 */

export type SchoolType = "grammar" | "independent";
export type Region =
  | "London"
  | "South East"
  | "South West"
  | "East of England"
  | "East Midlands"
  | "West Midlands"
  | "Yorkshire"
  | "North West"
  | "North East"
  | "Scotland"
  | "Wales"
  | "Northern Ireland";

export const REGIONS: Region[] = ["London", "South East", "South West", "East of England", "East Midlands", "West Midlands", "Yorkshire", "North West", "North East", "Scotland", "Wales", "Northern Ireland"];

export interface School {
  id: string;
  name: string;
  type: SchoolType;
  gender: "Boys" | "Girls" | "Co-ed" | "Check website";
  area: string;
  region: Region;
  /** Main ages you can join at, e.g. ["11+", "16+"]. */
  entry: string[];
  note?: string;
}

const REGION_CODES: Record<string, Region> = { L: "London", SE: "South East", SW: "South West", E: "East of England", EM: "East Midlands", WM: "West Midlands", Y: "Yorkshire", NW: "North West", NE: "North East", S: "Scotland", W: "Wales", NI: "Northern Ireland" };
const GENDERS: Record<string, School["gender"]> = { B: "Boys", G: "Girls", C: "Co-ed", "?": "Check website" };
const NOTES: Partial<Record<Region, Partial<Record<SchoolType, string>>>> = {
  "Northern Ireland": { grammar: "Uses the Northern Ireland transfer test, taken in P7." },
  Scotland: { independent: "Scotland has no state grammar schools. S1 starts around age 11–12." },
  Wales: { independent: "Wales has no state grammar schools." },
};

/**
 * One school per line: type | gender | name | town | region | entry ages | note.
 * Type: G grammar, I independent. Gender: B, G, C (co-ed) or ? (check).
 */
const DATA = `
G|B|Queen Elizabeth's School|Barnet|L|11
G|G|The Henrietta Barnett School|Hampstead Garden Suburb|L|11
G|G|St Michael's Catholic Grammar School|Finchley|L|11
G|C|The Latymer School|Edmonton|L|11
G|B|Tiffin School|Kingston upon Thames|L|11
G|G|The Tiffin Girls' School|Kingston upon Thames|L|11
G|B|Wilson's School|Wallington|L|11
G|B|Sutton Grammar School|Sutton|L|11
G|G|Nonsuch High School for Girls|Cheam|L|11
G|G|Wallington High School for Girls|Wallington|L|11
G|B|Wallington County Grammar School|Wallington|L|11
G|G|Newstead Wood School|Orpington|L|11
G|B|St Olave's Grammar School|Orpington|L|11
G|G|Townley Grammar School|Bexleyheath|L|11
G|C|Bexley Grammar School|Welling|L|11
G|B|Beths Grammar School|Bexley|L|11
G|C|Chislehurst and Sidcup Grammar School|Sidcup|L|11
G|G|Woodford County High School|Woodford Green|L|11
G|B|Ilford County High School|Ilford|L|11
G|B|Dartford Grammar School|Dartford|SE|11
G|G|Dartford Grammar School for Girls|Dartford|SE|11
G|B|Wilmington Grammar School for Boys|Wilmington|SE|11
G|G|Wilmington Grammar School for Girls|Wilmington|SE|11
G|B|The Judd School|Tonbridge|SE|11
G|G|Tonbridge Grammar School|Tonbridge|SE|11
G|G|Weald of Kent Grammar School|Tonbridge|SE|11
G|B|The Skinners' School|Tunbridge Wells|SE|11
G|B|Tunbridge Wells Grammar School for Boys|Tunbridge Wells|SE|11
G|G|Tunbridge Wells Girls' Grammar School|Tunbridge Wells|SE|11
G|B|Maidstone Grammar School|Maidstone|SE|11
G|G|Maidstone Grammar School for Girls|Maidstone|SE|11
G|G|Invicta Grammar School|Maidstone|SE|11
G|B|Oakwood Park Grammar School|Maidstone|SE|11
G|B|Simon Langton Grammar School for Boys|Canterbury|SE|11
G|G|Simon Langton Girls' Grammar School|Canterbury|SE|11
G|C|Barton Court Grammar School|Canterbury|SE|11
G|C|Queen Elizabeth's Grammar School|Faversham|SE|11
G|B|Borden Grammar School|Sittingbourne|SE|11
G|G|Highsted Grammar School|Sittingbourne|SE|11
G|C|Sir Roger Manwood's School|Sandwich|SE|11
G|C|Dane Court Grammar School|Broadstairs|SE|11
G|C|Chatham & Clarendon Grammar School|Ramsgate|SE|11
G|B|Dover Grammar School for Boys|Dover|SE|11
G|G|Dover Grammar School for Girls|Dover|SE|11
G|B|The Harvey Grammar School|Folkestone|SE|11
G|G|Folkestone School for Girls|Folkestone|SE|11
G|B|The Norton Knatchbull School|Ashford|SE|11
G|G|Highworth Grammar School|Ashford|SE|11
G|C|Cranbrook School|Cranbrook|SE|11
G|G|Rochester Grammar School|Rochester|SE|11
G|B|Sir Joseph Williamson's Mathematical School|Rochester|SE|11
G|G|Fort Pitt Grammar School|Chatham|SE|11
G|B|Holcombe Grammar School|Chatham|SE|11
G|C|Rainham Mark Grammar School|Gillingham|SE|11
G|B|Gravesend Grammar School|Gravesend|SE|11
G|G|Mayfield Grammar School|Gravesend|SE|11
G|B|Royal Grammar School|High Wycombe|SE|11|Uses the Buckinghamshire transfer test.
G|G|Wycombe High School|High Wycombe|SE|11|Uses the Buckinghamshire transfer test.
G|B|John Hampden Grammar School|High Wycombe|SE|11|Uses the Buckinghamshire transfer test.
G|B|Dr Challoner's Grammar School|Amersham|SE|11|Uses the Buckinghamshire transfer test.
G|G|Dr Challoner's High School|Little Chalfont|SE|11|Uses the Buckinghamshire transfer test.
G|G|Beaconsfield High School|Beaconsfield|SE|11|Uses the Buckinghamshire transfer test.
G|C|The Royal Latin School|Buckingham|SE|11|Uses the Buckinghamshire transfer test.
G|B|Aylesbury Grammar School|Aylesbury|SE|11|Uses the Buckinghamshire transfer test.
G|G|Aylesbury High School|Aylesbury|SE|11|Uses the Buckinghamshire transfer test.
G|C|Sir Henry Floyd Grammar School|Aylesbury|SE|11|Uses the Buckinghamshire transfer test.
G|C|Burnham Grammar School|Burnham|SE|11|Uses the Buckinghamshire transfer test.
G|C|Chesham Grammar School|Chesham|SE|11|Uses the Buckinghamshire transfer test.
G|C|Sir William Borlase's Grammar School|Marlow|SE|11|Uses the Buckinghamshire transfer test.
G|B|Reading School|Reading|SE|11
G|G|Kendrick School|Reading|SE|11
G|C|Herschel Grammar School|Slough|SE|11
G|C|Langley Grammar School|Slough|SE|11
G|C|St Bernard's Catholic Grammar School|Slough|SE|11
G|C|Upton Court Grammar School|Slough|SE|11
G|B|Colchester Royal Grammar School|Colchester|E|11
G|G|Colchester County High School for Girls|Colchester|E|11
G|B|King Edward VI Grammar School|Chelmsford|E|11
G|G|Chelmsford County High School for Girls|Chelmsford|E|11
G|B|Southend High School for Boys|Southend-on-Sea|E|11
G|G|Southend High School for Girls|Southend-on-Sea|E|11
G|B|Westcliff High School for Boys|Westcliff-on-Sea|E|11
G|G|Westcliff High School for Girls|Westcliff-on-Sea|E|11
G|G|St Bernard's High School|Westcliff-on-Sea|E|11
G|B|St Thomas More High School|Westcliff-on-Sea|E|11
G|C|Pate's Grammar School|Cheltenham|SW|11
G|G|Denmark Road High School|Gloucester|SW|11
G|G|Ribston Hall High School|Gloucester|SW|11
G|B|Sir Thomas Rich's School|Gloucester|SW|11
G|C|The Crypt School|Gloucester|SW|11
G|B|Marling School|Stroud|SW|11
G|G|Stroud High School|Stroud|SW|11
G|B|Bishop Wordsworth's School|Salisbury|SW|11
G|G|South Wilts Grammar School for Girls|Salisbury|SW|11
G|B|Torquay Boys' Grammar School|Torquay|SW|11
G|G|Torquay Girls' Grammar School|Torquay|SW|11
G|C|Churston Ferrers Grammar School|Brixham|SW|11
G|C|Colyton Grammar School|Colyton|SW|11
G|B|Devonport High School for Boys|Plymouth|SW|11
G|G|Devonport High School for Girls|Plymouth|SW|11
G|G|Plymouth High School for Girls|Plymouth|SW|11
G|B|Bournemouth School|Bournemouth|SW|11
G|G|Bournemouth School for Girls|Bournemouth|SW|11
G|G|Parkstone Grammar School|Poole|SW|11
G|B|Poole Grammar School|Poole|SW|11
G|B|Boston Grammar School|Boston|EM|11
G|G|Boston High School|Boston|EM|11
G|C|Bourne Grammar School|Bourne|EM|11
G|C|Caistor Grammar School|Caistor|EM|11
G|B|Carre's Grammar School|Sleaford|EM|11
G|G|Kesteven and Sleaford High School|Sleaford|EM|11
G|G|Kesteven and Grantham Girls' School|Grantham|EM|11
G|B|The King's School|Grantham|EM|11
G|C|Queen Elizabeth's Grammar School|Alford|EM|11
G|C|Queen Elizabeth's High School|Gainsborough|EM|11
G|C|Queen Elizabeth's Grammar School|Horncastle|EM|11
G|C|Skegness Grammar School|Skegness|EM|11
G|B|Spalding Grammar School|Spalding|EM|11
G|G|Spalding High School|Spalding|EM|11
G|B|King Edward VI Camp Hill School for Boys|Birmingham|WM|11
G|G|King Edward VI Camp Hill School for Girls|Birmingham|WM|11
G|C|King Edward VI Five Ways School|Birmingham|WM|11
G|G|King Edward VI Handsworth School for Girls|Birmingham|WM|11
G|B|King Edward VI Handsworth Grammar School for Boys|Birmingham|WM|11
G|B|King Edward VI Aston School|Birmingham|WM|11
G|G|Sutton Coldfield Grammar School for Girls|Sutton Coldfield|WM|11
G|B|Bishop Vesey's Grammar School|Sutton Coldfield|WM|11
G|B|Queen Mary's Grammar School|Walsall|WM|11
G|G|Queen Mary's High School|Walsall|WM|11
G|G|Wolverhampton Girls' High School|Wolverhampton|WM|11
G|B|King Edward VI School|Stratford-upon-Avon|WM|11
G|G|Stratford Girls' Grammar School|Stratford-upon-Avon|WM|11
G|C|Alcester Grammar School|Alcester|WM|11
G|B|Lawrence Sheriff School|Rugby|WM|11
G|G|Rugby High School|Rugby|WM|11
G|G|Newport Girls' High School|Newport, Shropshire|WM|11
G|B|Adams' Grammar School|Newport, Shropshire|WM|11
G|C|Ripon Grammar School|Ripon|Y|11
G|B|Ermysted's Grammar School|Skipton|Y|11
G|G|Skipton Girls' High School|Skipton|Y|11
G|C|Heckmondwike Grammar School|Heckmondwike|Y|11
G|C|North Halifax Grammar School|Halifax|Y|11
G|C|The Crossley Heath School|Halifax|Y|11
G|B|Altrincham Grammar School for Boys|Altrincham|NW|11
G|G|Altrincham Grammar School for Girls|Altrincham|NW|11
G|G|Loreto Grammar School|Altrincham|NW|11
G|B|St Ambrose College|Hale Barns|NW|11
G|C|Sale Grammar School|Sale|NW|11
G|C|Stretford Grammar School|Stretford|NW|11
G|C|Urmston Grammar|Urmston|NW|11
G|B|Calday Grange Grammar School|West Kirby|NW|11
G|G|West Kirby Grammar School|West Kirby|NW|11
G|B|Wirral Grammar School for Boys|Bebington|NW|11
G|G|Wirral Grammar School for Girls|Bebington|NW|11
G|G|Upton Hall School FCJ|Upton, Wirral|NW|11
G|B|St Anselm's College|Birkenhead|NW|11
G|B|Lancaster Royal Grammar School|Lancaster|NW|11
G|G|Lancaster Girls' Grammar School|Lancaster|NW|11
G|C|Clitheroe Royal Grammar School|Clitheroe|NW|11
G|C|Queen Elizabeth Grammar School|Penrith|NW|11
G|C|Methodist College Belfast|Belfast|NI|11
G|B|Royal Belfast Academical Institution|Belfast|NI|11
G|C|Belfast Royal Academy|Belfast|NI|11
G|C|Wellington College Belfast|Belfast|NI|11
G|C|Grosvenor Grammar School|Belfast|NI|11
G|G|Strathearn School|Belfast|NI|11
G|B|Campbell College|Belfast|NI|11
G|G|Victoria College Belfast|Belfast|NI|11
G|B|St Malachy's College|Belfast|NI|11
G|G|Dominican College Fortwilliam|Belfast|NI|11
G|G|St Dominic's Grammar School for Girls|Belfast|NI|11
G|C|Rathmore Grammar School|Belfast|NI|11
G|C|Our Lady and St Patrick's College, Knock|Belfast|NI|11
G|C|Aquinas Diocesan Grammar School|Belfast|NI|11
G|C|Sullivan Upper School|Holywood|NI|11
G|B|Bangor Grammar School|Bangor|NI|11
G|G|Glenlola Collegiate School|Bangor|NI|11
G|C|Friends' School Lisburn|Lisburn|NI|11
G|C|Wallace High School|Lisburn|NI|11
G|C|Lumen Christi College|Derry/Londonderry|NI|11
G|C|Foyle College|Derry/Londonderry|NI|11
G|G|Thornhill College|Derry/Londonderry|NI|11
G|B|St Columb's College|Derry/Londonderry|NI|11
G|C|Coleraine Grammar School|Coleraine|NI|11
G|C|Dalriada School|Ballymoney|NI|11
G|C|Ballymena Academy|Ballymena|NI|11
G|C|Cambridge House Grammar School|Ballymena|NI|11
G|C|The Royal School Armagh|Armagh|NI|11
G|C|The Royal School Dungannon|Dungannon|NI|11
G|C|Omagh Academy|Omagh|NI|11
G|C|Enniskillen Royal Grammar School|Enniskillen|NI|11
G|G|Mount Lourdes Grammar School|Enniskillen|NI|11
G|B|St Michael's College|Enniskillen|NI|11
G|G|Sacred Heart Grammar School|Newry|NI|11
G|B|Abbey Grammar School|Newry|NI|11
G|C|Down High School|Downpatrick|NI|11
G|G|Assumption Grammar School|Ballynahinch|NI|11
G|C|Rainey Endowed School|Magherafelt|NI|11
G|C|Banbridge Academy|Banbridge|NI|11
G|C|Antrim Grammar School|Antrim|NI|11
G|C|Carrickfergus Grammar School|Carrickfergus|NI|11
G|C|Larne Grammar School|Larne|NI|11
I|B|St Paul's School|Barnes|L|13 16|Younger boys join St Paul's Juniors at 7+ or 11+.
I|G|St Paul's Girls' School|Hammersmith|L|11 16
I|?|Westminster School|Westminster|L|13 16|Younger pupils join Westminster Under School.
I|B|Harrow School|Harrow on the Hill|L|13 16
I|G|North London Collegiate School|Edgware|L|11 16
I|B|City of London School|City of London|L|11 13 16
I|G|City of London School for Girls|City of London|L|11 16
I|C|Latymer Upper School|Hammersmith|L|11 13 16
I|B|Dulwich College|Dulwich|L|11 13 16
I|C|Alleyn's School|Dulwich|L|11 16
I|G|James Allen's Girls' School|Dulwich|L|11 16
I|G|Wimbledon High School|Wimbledon|L|11 16
I|?|King's College School|Wimbledon|L|11 13 16
I|G|Godolphin and Latymer School|Hammersmith|L|11 16
I|C|Highgate School|Highgate|L|11 16
I|?|University College School|Hampstead|L|11 16
I|G|South Hampstead High School|Hampstead|L|11 16
I|G|Channing School|Highgate|L|11 16
I|B|Merchant Taylors' School|Northwood|L|11 13 16
I|G|St Helen's School|Northwood|L|11 16
I|C|Mill Hill School|Mill Hill|L|13 16
I|C|Emanuel School|Battersea|L|11 13 16
I|B|Whitgift School|South Croydon|L|11 13 16
I|B|Trinity School|Croydon|L|11 13 16
I|B|Hampton School|Hampton|L|11 13 16
I|G|The Lady Eleanor Holles School|Hampton|L|11 16
I|C|Kingston Grammar School|Kingston upon Thames|L|11 16|Independent, despite the name.
I|G|Surbiton High School|Surbiton|L|11 16
I|C|Forest School|Walthamstow|L|11 16
I|C|Bancroft's School|Woodford Green|L|11 16
I|G|Notting Hill and Ealing High School|Ealing|L|11 16
I|C|St Benedict's School|Ealing|L|11 16
I|C|Eltham College|Eltham|L|11 16
I|G|Blackheath High School|Blackheath|L|11 16
I|C|Colfe's School|Lee|L|11 16
I|B|Eton College|Windsor|SE|13 16|Assessment for 13+ entry starts in Year 6.
I|?|Winchester College|Winchester|SE|13 16
I|G|Wycombe Abbey|High Wycombe|SE|11 13 16
I|C|Brighton College|Brighton|SE|11 13 16
I|C|Sevenoaks School|Sevenoaks|SE|11 13 16
I|B|Tonbridge School|Tonbridge|SE|13 16
I|C|Wellington College|Crowthorne|SE|13 16
I|B|Radley College|Abingdon|SE|13 16
I|B|Abingdon School|Abingdon|SE|11 13 16
I|?|Magdalen College School|Oxford|SE|11 13 16
I|G|Oxford High School|Oxford|SE|11 16
I|C|St Edward's School|Oxford|SE|13 16
I|C|Bradfield College|Bradfield|SE|13 16
I|C|Stowe School|Buckingham|SE|13 16
I|C|Charterhouse|Godalming|SE|13 16
I|B|Royal Grammar School Guildford|Guildford|SE|11 13 16
I|G|Guildford High School|Guildford|SE|11 16
I|C|Cranleigh School|Cranleigh|SE|11 13 16
I|?|Reading Blue Coat School|Sonning|SE|11 13 16
I|G|Downe House|Cold Ash|SE|11 13 16
I|G|St Mary's School Ascot|Ascot|SE|11 13 16
I|C|Lancing College|Lancing|SE|13 16
I|C|Hurstpierpoint College|Hurstpierpoint|SE|11 13 16
I|C|Christ's Hospital|Horsham|SE|11 13 16|Many pupils get help with fees.
I|G|Benenden School|Benenden|SE|11 13 16
I|C|The King's School|Canterbury|SE|13 16
I|G|Roedean School|Brighton|SE|11 13 16
I|C|The Portsmouth Grammar School|Portsmouth|SE|11 13 16
I|C|The Perse School|Cambridge|E|11 13 16
I|C|Stephen Perse|Cambridge|E|11 16
I|C|The Leys School|Cambridge|E|11 13 16
I|C|Norwich School|Norwich|E|11 13 16
I|C|Gresham's School|Holt|E|11 13 16
I|B|Bedford School|Bedford|E|11 13 16
I|C|Berkhamsted School|Berkhamsted|E|11 16
I|?|St Albans School|St Albans|E|11 13 16
I|G|St Albans High School for Girls|St Albans|E|11 16
I|C|Haileybury|Hertford|E|11 13 16
I|C|Felsted School|Felsted|E|11 13 16
I|C|Brentwood School|Brentwood|E|11 16
I|C|Chigwell School|Chigwell|E|11 13 16
I|C|Bishop's Stortford College|Bishop's Stortford|E|13 16
I|C|Oundle School|Oundle|EM|11 13 16
I|C|Uppingham School|Uppingham|EM|13 16
I|C|Oakham School|Oakham|EM|11 13 16
I|C|Nottingham High School|Nottingham|EM|11 16
I|B|Loughborough Grammar School|Loughborough|EM|11 13 16
I|G|Loughborough High School|Loughborough|EM|11 16
I|C|Leicester Grammar School|Leicester|EM|11 16
I|C|Repton School|Repton|EM|13 16
I|C|Trent College|Long Eaton|EM|11 16
I|C|Rugby School|Rugby|WM|11 13 16
I|C|Shrewsbury School|Shrewsbury|WM|13 16
I|?|King Edward's School|Birmingham|WM|11 16
I|G|King Edward VI High School for Girls|Birmingham|WM|11 16
I|B|Warwick School|Warwick|WM|11 13 16
I|G|King's High School|Warwick|WM|11 16
I|C|Solihull School|Solihull|WM|11 13 16
I|C|Malvern College|Malvern|WM|13 16
I|C|Bromsgrove School|Bromsgrove|WM|11 13 16
I|C|RGS Worcester|Worcester|WM|11 16
I|C|Wolverhampton Grammar School|Wolverhampton|WM|11 16|Independent, despite the name.
I|C|Hereford Cathedral School|Hereford|WM|11 16
I|G|Cheltenham Ladies' College|Cheltenham|SW|11 13 16
I|C|Cheltenham College|Cheltenham|SW|13 16
I|C|Dean Close School|Cheltenham|SW|11 13 16
I|C|Marlborough College|Marlborough|SW|13 16
I|C|Bristol Grammar School|Bristol|SW|11 16|Independent, despite the name.
I|C|Clifton College|Bristol|SW|13 16
I|G|Badminton School|Bristol|SW|11 16
I|C|Millfield|Street|SW|13 16
I|C|Wells Cathedral School|Wells|SW|11 16
I|C|King's College|Taunton|SW|13 16
I|C|Exeter School|Exeter|SW|11 16
I|C|Blundell's School|Tiverton|SW|11 13 16
I|C|Truro School|Truro|SW|11 16
I|C|Canford School|Wimborne|SW|13 16
I|C|Bryanston School|Blandford|SW|13 16
I|B|Sherborne School|Sherborne|SW|13 16
I|G|Sherborne Girls|Sherborne|SW|11 13 16
I|C|Monkton Combe School|Bath|SW|11 13 16
I|C|King Edward's School|Bath|SW|11 16
I|C|The Grammar School at Leeds|Leeds|Y|11 16|Independent, despite the name.
I|C|Bradford Grammar School|Bradford|Y|11 16|Independent, despite the name.
I|C|St Peter's School|York|Y|13 16
I|C|Pocklington School|Pocklington|Y|11 13 16
I|C|Ampleforth College|York|Y|13 16
I|G|Sheffield High School for Girls|Sheffield|Y|11 16
I|C|Ashville College|Harrogate|Y|11 16
I|C|Hymers College|Hull|Y|11 16
I|B|The Manchester Grammar School|Manchester|NW|11 16|Independent, despite the name.
I|G|Manchester High School for Girls|Manchester|NW|11 16
I|G|Withington Girls' School|Manchester|NW|11 16
I|C|Stockport Grammar School|Stockport|NW|11 16|Independent, despite the name.
I|C|Cheadle Hulme School|Cheadle Hulme|NW|11 16
I|B|Bolton School Boys' Division|Bolton|NW|11 16
I|G|Bolton School Girls' Division|Bolton|NW|11 16
I|C|The King's School|Chester|NW|11 16
I|C|Liverpool College|Liverpool|NW|11 16
I|C|Sedbergh School|Sedbergh|NW|13 16
I|C|Kirkham Grammar School|Kirkham|NW|11 16|Independent, despite the name.
I|C|Stonyhurst College|Clitheroe|NW|11 13 16
I|C|Royal Grammar School Newcastle|Newcastle upon Tyne|NE|11 16|Independent, despite the name.
I|G|Newcastle High School for Girls|Newcastle upon Tyne|NE|11 16
I|C|Durham School|Durham|NE|11 13 16
I|C|Dame Allan's Schools|Newcastle upon Tyne|NE|11 16
I|C|Barnard Castle School|Barnard Castle|NE|11 13 16
I|C|Yarm School|Yarm|NE|11 16
I|C|Fettes College|Edinburgh|S|11 13 16
I|C|George Heriot's School|Edinburgh|S|11
I|C|George Watson's College|Edinburgh|S|11
I|G|The Mary Erskine School|Edinburgh|S|11
I|B|Stewart's Melville College|Edinburgh|S|11
I|C|The Edinburgh Academy|Edinburgh|S|11
I|B|Merchiston Castle School|Edinburgh|S|11 13
I|G|St George's School for Girls|Edinburgh|S|11
I|C|Loretto School|Musselburgh|S|11 13 16
I|C|The High School of Glasgow|Glasgow|S|11
I|C|Hutchesons' Grammar School|Glasgow|S|11
I|C|The Glasgow Academy|Glasgow|S|11
I|C|Kelvinside Academy|Glasgow|S|11
I|C|St Aloysius' College|Glasgow|S|11
I|C|Robert Gordon's College|Aberdeen|S|11
I|C|Dollar Academy|Dollar|S|11
I|C|Gordonstoun|Elgin|S|13 16
I|C|Strathallan School|Forgandenny|S|11 13 16
I|C|Glenalmond College|Glenalmond|S|13 16
I|C|Christ College Brecon|Brecon|W|11 13 16
I|G|Howell's School Llandaff|Cardiff|W|11 16
I|C|St John's College|Cardiff|W|11 16
I|C|Kings Monkton School|Cardiff|W|11 16
I|C|Rydal Penrhos|Colwyn Bay|W|11 16
I|C|Ruthin School|Ruthin|W|11 16
`;

const slug = (s: string) =>
  s
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/['’]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");

/** Old ids from the first list, so saved targets keep working. */
const LEGACY: Record<string, string> = {
  "st-pauls": "St Paul's School|Barnes",
  spgs: "St Paul's Girls' School|Hammersmith",
  westminster: "Westminster School|Westminster",
  eton: "Eton College|Windsor",
  harrow: "Harrow School|Harrow on the Hill",
  winchester: "Winchester College|Winchester",
  nlcs: "North London Collegiate School|Edgware",
  "wycombe-abbey": "Wycombe Abbey|High Wycombe",
  cls: "City of London School|City of London",
  clsg: "City of London School for Girls|City of London",
  "latymer-upper": "Latymer Upper School|Hammersmith",
  brighton: "Brighton College|Brighton",
  sevenoaks: "Sevenoaks School|Sevenoaks",
  tonbridge: "Tonbridge School|Tonbridge",
  mgs: "The Manchester Grammar School|Manchester",
  "cheltenham-ladies": "Cheltenham Ladies' College|Cheltenham",
  "qe-barnet": "Queen Elizabeth's School|Barnet",
  "henrietta-barnett": "The Henrietta Barnett School|Hampstead Garden Suburb",
  tiffin: "Tiffin School|Kingston upon Thames",
  "tiffin-girls": "The Tiffin Girls' School|Kingston upon Thames",
  wilsons: "Wilson's School|Wallington",
  "sutton-grammar": "Sutton Grammar School|Sutton",
  nonsuch: "Nonsuch High School for Girls|Cheam",
  "latymer-edmonton": "The Latymer School|Edmonton",
  reading: "Reading School|Reading",
  kendrick: "Kendrick School|Reading",
  "rgs-wycombe": "Royal Grammar School|High Wycombe",
  crgs: "Colchester Royal Grammar School|Colchester",
  pates: "Pate's Grammar School|Cheltenham",
  "camp-hill-boys": "King Edward VI Camp Hill School for Boys|Birmingham",
  agsb: "Altrincham Grammar School for Boys|Altrincham",
  agsg: "Altrincham Grammar School for Girls|Altrincham",
};
const legacyByKey = Object.fromEntries(Object.entries(LEGACY).map(([id, key]) => [key, id]));

export const SCHOOLS: School[] = DATA.trim()
  .split("\n")
  .map((line) => {
    const [t, g, name, area, r, entry, note] = line.split("|");
    const type: SchoolType = t === "G" ? "grammar" : "independent";
    const region = REGION_CODES[r];
    return {
      id: legacyByKey[`${name}|${area}`] ?? slug(`${name} ${area}`),
      name,
      type,
      gender: GENDERS[g],
      area,
      region,
      entry: entry.split(" ").map((e) => `${e}+`),
      note: note || NOTES[region]?.[type],
    };
  })
  .sort((a, b) => a.name.localeCompare(b.name));

export const schoolById = (id: string) => SCHOOLS.find((s) => s.id === id);

/** A web search for the school's admissions page (always current, never a broken link). */
export const admissionsLink = (s: School) => `https://www.google.com/search?q=${encodeURIComponent(`${s.name} ${s.area.split(",")[0]} admissions`)}`;

export const MAX_TARGETS = 3;

export const HOW_TO_GET_IN: Record<SchoolType, { title: string; points: string[] }> = {
  grammar: {
    title: "How grammar school entry usually works",
    points: [
      "Free state schools. Places go by your score in the 11+ test (and sometimes how far you live from the school).",
      "England: you usually register in the summer of Year 5 and sit the test in September of Year 6. Then list the school on your council's application by 31 October. Offers come on 1 March.",
      "Northern Ireland: grammar schools use a transfer test taken in P7.",
      "Tests cover some mix of maths, English, verbal reasoning and non-verbal reasoning, depending on the area.",
    ],
  },
  independent: {
    title: "How independent school entry usually works",
    points: [
      "Fee-paying schools with their own entry process. Many offer bursaries (help with fees) and scholarships.",
      "At 11+: register in Year 5 or early Year 6, then sit the school's exams (often November to January of Year 6) and an interview.",
      "At 13+: many schools use an online pre-test in Year 6 or 7, plus an interview, then offer a place years ahead.",
      "Academic scholarships usually mean extra, harder exams. Many schools publish sample papers on their websites.",
    ],
  },
};
