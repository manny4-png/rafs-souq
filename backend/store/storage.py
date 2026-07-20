from __future__ import annotations

from pathlib import PurePosixPath
from uuid import uuid4

from cloudinary import CloudinaryImage, uploader
from django.core.files.storage import Storage
from django.utils.deconstruct import deconstructible


@deconstructible
class CloudinaryMediaStorage(Storage):
    """Store Django ImageField uploads as private-to-write Cloudinary assets."""

    def _save(self, name, content):
        source = PurePosixPath(name)
        folder = source.parent.as_posix().strip("./")
        stem = source.stem or "image"
        public_id = "/".join(
            part for part in ("rafs-souq", folder, f"{stem}-{uuid4().hex}") if part
        )
        result = uploader.upload(
            content,
            public_id=public_id,
            resource_type="image",
            overwrite=False,
        )
        return result["public_id"]

    def url(self, name):
        return CloudinaryImage(name).build_url(secure=True)

    def exists(self, name):
        # Every upload receives a UUID, so collision checks are unnecessary.
        return False

    def delete(self, name):
        if name:
            uploader.destroy(name, resource_type="image", invalidate=True)

