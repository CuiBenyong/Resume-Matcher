SCHEMA = {
    "jobId": "string",
    "jobTitle": "string",
    "companyProfile": {
        "companyName": "string",
        "industry": "Optional[string]",
        "website": "Optional[string]",
        "description": "Optional[string]",
    },
    "location": {
        "city": "string",
        "state": "string",
        "country": "string",
        "remoteStatus": "enum: ['完全远程', '混合办公', '现场办公', '远程', '未指定']",
    },
    "datePosted": "YYYY-MM-DD",
    "employmentType": "enum: ['全职', '兼职', '合同工', '实习', '临时工', '未指定']",
    "jobSummary": "string",
    "keyResponsibilities": [
        "string",
        "...",
    ],
    "qualifications": {
        "required": [
            "string",
            "...",
        ],
        "preferred": [
            "string",
            "...",
        ],
    },
    "compensationAndBenefits": {
        "salaryRange": "string",
        "benefits": [
            "string",
            "...",
        ],
    },
    "applicationInfo": {
        "howToApply": "string",
        "applyLink": "string",
        "contactEmail": "Optional[string]",
    },
    "extractedKeywords": [
        "string",
        "...",
    ],
}
