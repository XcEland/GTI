from django.test import SimpleTestCase, TestCase
from django.urls import reverse


class HealthCheckTests(SimpleTestCase):
    def test_health_check_reports_api_is_ready(self):
        response = self.client.get(reverse("health-check"))

        self.assertEqual(response.status_code, 200)
        self.assertEqual(
            response.json(), {"status": "ok", "service": "geotarget-api"}
        )


class ProjectApiTests(TestCase):
    project_payload = {
        "name": "Great Dyke Chrome Pilot",
        "commodity": "Chrome",
        "country": "Zimbabwe",
        "project_type": "Exploration",
        "description": "Early-stage chrome exploration programme.",
        "area_of_interest": {
            "type": "Polygon",
            "coordinates": [[
                [29.70, -19.10],
                [30.05, -19.10],
                [30.05, -18.75],
                [29.70, -18.75],
                [29.70, -19.10],
            ]],
        },
    }

    def test_create_list_and_retrieve_project(self):
        create_response = self.client.post(
            reverse("project-list"),
            self.project_payload,
            content_type="application/json",
        )

        self.assertEqual(create_response.status_code, 201)
        created = create_response.json()
        self.assertEqual(created["name"], "Great Dyke Chrome Pilot")
        self.assertEqual(created["area_of_interest"]["type"], "Polygon")
        self.assertEqual(created["coordinate_system"], "EPSG:4326")
        self.assertEqual(created["vertex_count"], 4)
        self.assertGreater(float(created["area_km2"]), 0)
        self.assertGreater(float(created["perimeter_km"]), 0)

        list_response = self.client.get(reverse("project-list"))
        self.assertEqual(list_response.status_code, 200)
        self.assertEqual(len(list_response.json()), 1)

        detail_response = self.client.get(
            reverse("project-detail", args=[created["id"]])
        )
        self.assertEqual(detail_response.status_code, 200)
        self.assertEqual(detail_response.json()["id"], created["id"])

    def test_rejects_a_non_polygon_area_of_interest(self):
        payload = {
            **self.project_payload,
            "area_of_interest": {
                "type": "LineString",
                "coordinates": [[29.70, -19.10], [30.05, -18.75]],
            },
        }

        response = self.client.post(
            reverse("project-list"), payload, content_type="application/json"
        )

        self.assertEqual(response.status_code, 400)
        self.assertIn("area_of_interest", response.json())

