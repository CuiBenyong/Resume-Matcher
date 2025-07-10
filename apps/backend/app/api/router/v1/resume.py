import logging
import traceback

from uuid import uuid4
from sqlalchemy.ext.asyncio import AsyncSession
from fastapi.responses import JSONResponse, StreamingResponse
from fastapi import (
    APIRouter,
    File,
    UploadFile,
    HTTPException,
    Depends,
    Request,
    status,
    Query,
)

from app.core import get_db_session
from app.services import (
    ResumeService,
    ScoreImprovementService,
    ResumeNotFoundError,
    ResumeParsingError,
    JobNotFoundError,
)
from app.schemas.pydantic import ResumeImprovementRequest

resume_router = APIRouter()
logger = logging.getLogger(__name__)


@resume_router.post(
    "/upload",
    summary="Upload a resume in PDF or DOCX format and store it into DB in HTML/Markdown format",
)
async def upload_resume(
    request: Request,
    file: UploadFile = File(...),
    db: AsyncSession = Depends(get_db_session),
):
    """
    Accepts a PDF or DOCX file, converts it to HTML/Markdown, and stores it in the database.

    Raises:
        HTTPException: If the file type is not supported or if the file is empty.
    """
    request_id = getattr(request.state, "request_id", str(uuid4()))

    allowed_content_types = [
        "application/pdf",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ]

    if file.content_type not in allowed_content_types:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid file type. Only PDF and DOCX files are allowed.",
        )

    file_bytes = await file.read()
    if not file_bytes:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Empty file. Please upload a valid file.",
        )

    try:
        resume_service = ResumeService(db)
        resume_id = await resume_service.convert_and_store_resume(
            file_bytes=file_bytes,
            file_type=file.content_type,
            filename=file.filename,
            content_type="md",
        )
    except Exception as e:
        logger.error(
            f"Error processing file: {str(e)} - traceback: {traceback.format_exc()}"
        )
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error processing file: {str(e)}",
        )

    return {
        "message": f"File {file.filename} successfully processed as MD and stored in the DB",
        "request_id": request_id,
        "resume_id": resume_id,
        "status": "success",
    }


@resume_router.post(
    "/improve",
    summary="Score and improve a resume against a job description",
)
async def score_and_improve(
    request: Request,
    payload: ResumeImprovementRequest,
    db: AsyncSession = Depends(get_db_session),
    stream: bool = Query(
        False, description="Enable streaming response using Server-Sent Events"
    ),
):
    """
    Scores and improves a resume against a job description.

    Raises:
        HTTPException: If the resume or job is not found.
    """
    request_id = getattr(request.state, "request_id", str(uuid4()))
    headers = {"X-Request-ID": request_id}

    request_payload = payload.model_dump()

    try:
        resume_id = str(request_payload.get("resume_id", ""))
        if not resume_id:
            raise ResumeNotFoundError(
                message="invalid value passed in `resume_id` field, please try again with valid resume_id."
            )
        job_id = str(request_payload.get("job_id", ""))
        if not job_id:
            raise JobNotFoundError(
                message="invalid value passed in `job_id` field, please try again with valid job_id."
            )
        score_improvement_service = ScoreImprovementService(db=db)

        if stream:
            return StreamingResponse(
                content=score_improvement_service.run_and_stream(
                    resume_id=resume_id,
                    job_id=job_id,
                ),
                media_type="text/event-stream",
                headers=headers,
            )
        else:
            improvements = await score_improvement_service.run(
                resume_id=resume_id,
                job_id=job_id,
            )
            return JSONResponse(
                content={
                    "request_id": request_id,
                    "data": improvements,
                },
                headers=headers,
            )
    except ResumeNotFoundError as e:
        logger.error(str(e))
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e),
        )
    except JobNotFoundError as e:
        logger.error(str(e))
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e),
        )
    except ResumeParsingError as e:
        logger.error(str(e))
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e),
        )
    except Exception as e:
        logger.error(f"Error: {str(e)} - traceback: {traceback.format_exc()}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="sorry, something went wrong!",
        )


@resume_router.get(
    "",
    summary="Get resume data from both resume and processed_resume models",
)
async def get_resume(
    request: Request,
    resume_id: str = Query(..., description="Resume ID to fetch data for"),
    db: AsyncSession = Depends(get_db_session),
):
    """
    Retrieves resume data from both resume_model and processed_resume model by resume_id.

    Args:
        resume_id: The ID of the resume to retrieve

    Returns:
        Combined data from both resume and processed_resume models

    Raises:
        HTTPException: If the resume is not found or if there's an error fetching data.
    """
    request_id = getattr(request.state, "request_id", str(uuid4()))
    headers = {"X-Request-ID": request_id}

    try:
        if not resume_id:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="resume_id is required",
            )

        resume_service = ResumeService(db)
        resume_data = await resume_service.get_resume_with_processed_data(
            resume_id=resume_id
        )
        
        if not resume_data:
            raise ResumeNotFoundError(
                message=f"Resume with id {resume_id} not found"
            )

        return JSONResponse(
            content={
                "request_id": request_id,
                "data": resume_data,
            },
            headers=headers,
        )
    
    except ResumeNotFoundError as e:
        logger.error(str(e))
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=str(e),
        )
    except Exception as e:
        logger.error(f"Error fetching resume: {str(e)} - traceback: {traceback.format_exc()}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Error fetching resume data",
        )


@resume_router.get(
    "/list",
    summary="Get list of uploaded resumes",
)
async def get_resume_list(
    request: Request,
    page: int = Query(1, ge=1, description="Page number (starting from 1)"),
    page_size: int = Query(10, ge=1, le=100, description="Number of items per page"),
    search: str = Query(None, description="Search by filename or content"),
    db: AsyncSession = Depends(get_db_session),
):
    """
    Retrieves a paginated list of uploaded resumes.

    Args:
        page: Page number (starting from 1)
        page_size: Number of items per page (1-100)
        search: Optional search term to filter by filename or content

    Returns:
        Paginated list of resumes with metadata

    Raises:
        HTTPException: If there's an error fetching the resume list.
    """
    request_id = getattr(request.state, "request_id", str(uuid4()))
    headers = {"X-Request-ID": request_id}

    try:
        resume_service = ResumeService(db)
        
        # 计算偏移量
        offset = (page - 1) * page_size
        
        # 获取简历列表和总数
        resumes, total_count = await resume_service.get_resume_list(
            offset=offset,
            limit=page_size,
            search=search
        )
        
        # 计算分页信息
        total_pages = (total_count + page_size - 1) // page_size
        has_next = page < total_pages
        has_prev = page > 1
        
        return JSONResponse(
            content={
                "request_id": request_id,
                "data": {
                    "resumes": resumes,
                    "pagination": {
                        "current_page": page,
                        "page_size": page_size,
                        "total_count": total_count,
                        "total_pages": total_pages,
                        "has_next": has_next,
                        "has_prev": has_prev
                    }
                },
            },
            headers=headers,
        )
        
    except Exception as e:
        logger.error(f"Error fetching resume list: {str(e)} - traceback: {traceback.format_exc()}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Error fetching resume list",
        )

