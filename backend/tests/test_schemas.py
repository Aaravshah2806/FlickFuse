import pytest
from pydantic import ValidationError
import sys
import os

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.schemas import (
    FriendRequestCreate,
    FriendRequestResponse,
    ListCreate,
    ListUpdate,
    ListItemCreate,
    ProfileResponse,
    FriendshipStatus,
    VisibilityLevel,
    ContentType,
    RecommendationSource,
)


class TestFriendRequestSchemas:
    def test_friend_request_create_valid(self):
        data = FriendRequestCreate(receiver_id="user-123")
        assert data.receiver_id == "user-123"

    def test_friend_request_create_missing_receiver(self):
        with pytest.raises(ValidationError):
            FriendRequestCreate()

    def test_friendship_status_enum(self):
        assert FriendshipStatus.PENDING.value == "pending"
        assert FriendshipStatus.ACCEPTED.value == "accepted"
        assert FriendshipStatus.REJECTED.value == "rejected"


class TestListSchemas:
    def test_list_create_valid(self):
        data = ListCreate(title="My List", description="A test list")
        assert data.title == "My List"
        assert data.description == "A test list"

    def test_list_create_title_required(self):
        with pytest.raises(ValidationError):
            ListCreate()

    def test_list_create_title_too_long(self):
        with pytest.raises(ValidationError):
            ListCreate(title="x" * 101)

    def test_list_create_description_too_long(self):
        with pytest.raises(ValidationError):
            ListCreate(title="Valid", description="x" * 501)

    def test_list_update_partial(self):
        data = ListUpdate(title="Updated Title")
        assert data.title == "Updated Title"
        assert data.description is None

    def test_list_item_create_valid(self):
        data = ListItemCreate(content_id="content-123", position=1)
        assert data.content_id == "content-123"
        assert data.position == 1

    def test_list_item_create_default_position(self):
        data = ListItemCreate(content_id="content-123")
        assert data.position == 0

    def test_visibility_level_enum(self):
        assert VisibilityLevel.PUBLIC.value == "public"
        assert VisibilityLevel.FRIENDS.value == "friends"
        assert VisibilityLevel.PRIVATE.value == "private"


class TestProfileSchemas:
    def test_profile_response_required_fields(self):
        from datetime import datetime
        data = ProfileResponse(
            id="user-123",
            unique_id="unique-123",
            created_at=datetime.now(),
            updated_at=datetime.now()
        )
        assert data.id == "user-123"
        assert data.privacy_setting == "public"

    def test_profile_response_optional_fields(self):
        from datetime import datetime
        data = ProfileResponse(
            id="user-123",
            unique_id="unique-123",
            username="testuser",
            display_name="Test User",
            bio="A test bio",
            avatar_url="https://example.com/avatar.jpg",
            created_at=datetime.now(),
            updated_at=datetime.now()
        )
        assert data.username == "testuser"
        assert data.display_name == "Test User"


class TestContentSchemas:
    def test_content_type_enum(self):
        assert ContentType.MOVIE.value == "movie"
        assert ContentType.SERIES.value == "series"

    def test_recommendation_source_enum(self):
        assert RecommendationSource.TASTE_PROFILE.value == "taste_profile"
        assert RecommendationSource.FRIENDS.value == "friends"
        assert RecommendationSource.TRENDING.value == "trending"
        assert RecommendationSource.SIMILAR.value == "similar"
