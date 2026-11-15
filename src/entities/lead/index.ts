export {
    LEAD_CONTACT_TYPES,
    LEAD_LIMITS,
    type Lead,
    type LeadContactType,
} from "./model/lead.types";
export {
    isLeadContactType,
    isValidLeadEmail,
    isValidLeadMessage,
    isValidLeadName,
    isValidLeadPhone,
    parseLeadBody,
} from "./lib/validate-lead";
