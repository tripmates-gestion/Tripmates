import type {AccountType, BusinessType} from "./AccountTypes";
import type {DayOfWeek} from "./business";

//esta es la data que debeŕia devolverme el Back en search
export type BusinessAccountDataDTO = {
    id: string;//PEDIRLE A BACK
    name: string;
    email: string;
    role: AccountType;
    description: string;
    avatarURL: string;
    businessType: BusinessType;
    openingDays: DayOfWeek[];
    attentionSchedule: 
    photoUrl: string;

}