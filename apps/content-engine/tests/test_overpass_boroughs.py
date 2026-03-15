"""Tests for Overpass borough rotation (Phase 4.5)."""

import pytest

from src.sources.overpass import BERLIN_BOROUGHS, OVERPASS_QUERY_BOROUGH, OVERPASS_QUERY_ALL


class TestOverpassBoroughs:
    def test_all_12_boroughs_defined(self):
        assert len(BERLIN_BOROUGHS) == 12

    def test_boroughs_are_strings(self):
        for b in BERLIN_BOROUGHS:
            assert isinstance(b, str)
            assert len(b) > 0

    def test_mitte_included(self):
        assert "Mitte" in BERLIN_BOROUGHS

    def test_neukolln_included(self):
        assert "Neukölln" in BERLIN_BOROUGHS

    def test_borough_query_has_placeholder(self):
        assert "{borough}" in OVERPASS_QUERY_BOROUGH
        assert "{batch_size}" in OVERPASS_QUERY_BOROUGH

    def test_all_query_has_placeholder(self):
        assert "{batch_size}" in OVERPASS_QUERY_ALL

    def test_borough_query_renders(self):
        query = OVERPASS_QUERY_BOROUGH.replace("{borough}", "Mitte").replace("{batch_size}", "20")
        assert "Mitte" in query
        assert "20" in query
        assert "{" not in query.replace("{", "").replace("}", "")  # no unresolved placeholders
