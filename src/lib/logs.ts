import { LogsView } from "@/features/activityLogs/schemas/logs.schema";

type ActivityMetadata = {
    reference?: string; // Présent si c'est un document
    name?: string;      // Présent si c'est un client
};

export type Resource = keyof typeof ACTIVITY_MESSAGES;
type Action = keyof typeof ACTIVITY_MESSAGES[Resource];
type Status = keyof typeof ACTIVITY_MESSAGES[Resource][Action];

export type ActivityBuild = {
    resource: Resource; // ex: "document", "client"
    action: Action; // ex: "create", "update", "delete"
    status: Status; // ex: "success", "error"
    metadata: ActivityMetadata;
}

type LogJson = {
    resource: Resource;
    metadata: ActivityMetadata;
    action_nature: Action;
}

const DOCUMENT_MESSAGES = {
    insert: {
        success: (data: ActivityMetadata) => `Le document ${data.reference} a été créé`,
        error: (data: ActivityMetadata) => `Le document ${data.reference} n'a pas pu être créé`,
    },
    update: {
        success: (data: ActivityMetadata) => `Le document ${data.reference} a été modifié`,
        error: (data: ActivityMetadata) => `Le document ${data.reference} n'a pas pu être modifié`,
    },
    delete: {
        success: (data: ActivityMetadata) => `Le document ${data.reference} a été supprimé`,
        error: (data: ActivityMetadata) => `Le document ${data.reference} n'a pas pu être supprimé`,
    }
};

const ACTIVITY_MESSAGES = {
    company_addresses: {
        insert: {
            success: (data: ActivityMetadata) => `Une nouvelle adresse d'entreprise à ${data.name} a été ajoutée`,
            error: (data: ActivityMetadata) => `Une nouvelle adresse d'entreprise à ${data.name} n'a pas pu être ajoutée`,
        },
        update: {
            success: (data: ActivityMetadata) => `Une adresse d'entreprise à ${data.name} a été modifiée`,
            error: (data: ActivityMetadata) => `Une adresse d'entreprise à ${data.name} n'a pas pu être modifiée`,
        },
        delete: {
            success: (data: ActivityMetadata) => `Une adresse d'entreprise à ${data.name} a été supprimée`,
            error: (data: ActivityMetadata) => `Une adresse d'entreprise à ${data.name} n'a pas pu être supprimée`,
        }
    },
    company_bank_accounts: {
        insert: {
            success: (data: ActivityMetadata) => `Un nouveau compte bancaire d'entreprise à ${data.name} a été ajouté`,
            error: (data: ActivityMetadata) => `Un nouveau compte bancaire d'entreprise à ${data.name} n'a pas pu être ajouté`,
        },
        update: {
            success: (data: ActivityMetadata) => `Un compte bancaire d'entreprise à ${data.name} a été modifié`,
            error: (data: ActivityMetadata) => `Un compte bancaire d'entreprise à ${data.name} n'a pas pu être modifié`,
        },
        delete: {
            success: (data: ActivityMetadata) => `Un compte bancaire d'entreprise à ${data.name} a été supprimé`,
            error: (data: ActivityMetadata) => `Un compte bancaire d'entreprise à ${data.name} n'a pas pu être supprimé`,
        }
    },
    documents: DOCUMENT_MESSAGES,
    documents_with_client: DOCUMENT_MESSAGES,
    clients: {
        insert: {
            success: (data: ActivityMetadata) => `Le client ${data.name} a été créé`,
            error: (data: ActivityMetadata) => `Le client ${data.name} n'a pas pu être créé`,
        },
        update: {
            success: (data: ActivityMetadata) => `Le client ${data.name} a été modifié`,
            error: (data: ActivityMetadata) => `Le client ${data.name} n'a pas pu être modifié`,
        },
        delete: {
            success: (data: ActivityMetadata) => `Le client ${data.name} a été supprimé`,
            error: (data: ActivityMetadata) => `Le client ${data.name} n'a pas pu être supprimé`,
        }
    },
    client_contacts: {
        insert: {
            success: (data: ActivityMetadata) => `Le contact ${data.name} a été ajouté`,
            error: (data: ActivityMetadata) => `Le contact ${data.name} n'a pas pu être ajouté`,
        },
        update: {
            success: (data: ActivityMetadata) => `Le contact ${data.name} a été modifié`,
            error: (data: ActivityMetadata) => `Le contact ${data.name} n'a pas pu être modifié`,
        },
        delete: {
            success: (data: ActivityMetadata) => `Le contact ${data.name} a été supprimé`,
            error: (data: ActivityMetadata) => `Le contact ${data.name} n'a pas pu être supprimé`,
        }
    },
    client_addresses: {
        insert: {
            success: (data: ActivityMetadata) => `Une nouvelle adresse cliente à ${data.name} a été ajoutée`,
            error: (data: ActivityMetadata) => `Une nouvelle adresse cliente à ${data.name} n'a pas pu être ajoutée`,
        },
        update: {
            success: (data: ActivityMetadata) => `Une adresse cliente à ${data.name} a été modifiée`,
            error: (data: ActivityMetadata) => `Une adresse cliente à ${data.name} n'a pas pu être modifiée`,
        },
        delete: {
            success: (data: ActivityMetadata) => `Une adresse cliente à ${data.name} a été supprimée`,
            error: (data: ActivityMetadata) => `Une adresse cliente à ${data.name} n'a pas pu être supprimée`,
        }
    },
};

function parseLogJson(log: LogsView): LogJson {
    if (typeof log.log_json === 'string') {
        return JSON.parse(log.log_json);
    }
    return log.log_json;
}

function buildActivityMessage(activity: ActivityBuild): string {
    return ACTIVITY_MESSAGES?.[activity.resource]?.[activity.action]?.[activity.status]?.(activity.metadata)
        ?? "Action effectuée";
}

export function getLogMessage(log: LogsView): string {
    const logJson = parseLogJson(log);
    const activity: ActivityBuild = {
        resource: logJson.resource,
        action: logJson.action_nature,
        status: log.status,
        metadata: logJson.metadata,
    };
    return buildActivityMessage(activity);
}

export function extractLogMetadata(
    resource: Resource,
    payload: Record<string, unknown>
): ActivityMetadata {
    console.log("payload", payload);
    switch (resource) {
        case "documents":
        case "documents_with_client":
            return { reference: (payload.number ?? payload.number_readonly ?? "N/A") as string };
        case "clients":
            return { name: (payload.name ?? "N/A") as string };
        case "client_contacts":
            return { name: (payload.full_name ?? "Contact") as string };
        case "client_addresses":
        case "company_addresses":
            return { name: (payload.city ?? "N/A") as string };
        case "company_bank_accounts":
            return { name: (payload.bank_name ?? "N/A") as string };

        default:
            return {};
    }
}
