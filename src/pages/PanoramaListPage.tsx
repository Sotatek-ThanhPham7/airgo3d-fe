/* eslint-disable @typescript-eslint/no-explicit-any */
import * as React from "react";
import { useState, useEffect, useCallback, useMemo } from "react";
import {
  Row,
  Col,
  Card,
  Image,
  Pagination,
  Spin,
  Alert,
  Tag,
  Typography,
  Space,
  Input,
  Select,
} from "antd";
import { SearchOutlined, FilterOutlined } from "@ant-design/icons";
import {
  panoramaApi,
  Panorama,
  PanoramaTag,
} from "../services/api/panoramaApi";
import { getImageUrl } from "../services/api/config";
import { FaBookmark, FaRegBookmark, FaHeart } from "react-icons/fa";

const { Text } = Typography;
const { Search } = Input;

const PanoramaListPage: React.FC = () => {
  const [panoramas, setPanoramas] = useState<Panorama[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 12,
    total: 0,
    totalPages: 0,
  });

  const [searchQuery, setSearchQuery] = useState<string>("");
  const [debouncedSearch, setDebouncedSearch] = useState<string>("");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [showBookmarkedOnly, setShowBookmarkedOnly] = useState<boolean>(false);

  const [tagOptions, setTagOptions] = useState<PanoramaTag[]>([]);
  const [tagSearchQuery, setTagSearchQuery] = useState<string>("");
  const [tagLoading, setTagLoading] = useState<boolean>(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery);
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  const fetchTagSuggestions = useCallback(async (search: string = "") => {
    setTagLoading(true);
    try {
      const response = await panoramaApi.getTagSuggestions({
        q: search,
        page: 1,
        limit: 10,
      });
      setTagOptions(response.data);
    } catch (err: any) {
      console.error("Error fetching tag suggestions:", err);
      setTagOptions([]);
    } finally {
      setTagLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTagSuggestions("");
  }, [fetchTagSuggestions]);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchTagSuggestions(tagSearchQuery);
    }, 300);

    return () => clearTimeout(timer);
  }, [tagSearchQuery, fetchTagSuggestions]);

  const fetchPanoramas = useCallback(
    async (page: number = 1) => {
      setLoading(true);
      setError(null);
      try {
        const params: any = {
          page,
          limit: pagination.limit,
        };

        if (debouncedSearch.trim()) {
          params.search = debouncedSearch.trim();
        }

        if (selectedTags.length > 0) {
          params.tags = selectedTags;
        }

        if (showBookmarkedOnly) {
          params.isBookmarked = true;
        }

        const response = await panoramaApi.getPanoramas(params);
        setPanoramas(response.data);
        setPagination({
          ...pagination,
          page: response.pagination.page,
          total: response.pagination.total,
          totalPages: response.pagination.totalPages,
        });
      } catch (err: any) {
        setError(err?.message || "Failed to fetch panoramas");
        console.error("Error fetching panoramas:", err);
      } finally {
        setLoading(false);
      }
    },
    [debouncedSearch, selectedTags, showBookmarkedOnly, pagination.limit]
  );

  useEffect(() => {
    fetchPanoramas(1);
  }, [debouncedSearch, selectedTags, showBookmarkedOnly]);

  const handleSearchChange = (value: string) => {
    setSearchQuery(value);
    setPagination((prev) => ({ ...prev, page: 1 }));
  };

  const handleTagChange = (tags: string[]) => {
    setSelectedTags(tags);
    setPagination((prev) => ({ ...prev, page: 1 }));
  };

  const handleBookmarkToggle = () => {
    setShowBookmarkedOnly(!showBookmarkedOnly);
    setPagination((prev) => ({ ...prev, page: 1 }));
  };

  const handlePageChange = (page: number) => {
    fetchPanoramas(page);
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + " " + sizes[i];
  };

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const tagColors = [
    "blue",
    "cyan",
    "green",
    "orange",
    "purple",
    "red",
    "volcano",
    "geekblue",
  ];

  const getTagColor = (index: number) => {
    return tagColors[index % tagColors.length];
  };

  const resultRange = useMemo(() => {
    if (pagination.total === 0) return { start: 0, end: 0 };
    const start = (pagination.page - 1) * pagination.limit + 1;
    const end = Math.min(pagination.page * pagination.limit, pagination.total);
    return { start, end };
  }, [pagination.page, pagination.limit, pagination.total]);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
          <div className="flex flex-col md:flex-row gap-4 items-center">
            <div className="flex-1 w-full md:w-auto">
              <Search
                placeholder="Search images..."
                allowClear
                enterButton={<SearchOutlined />}
                size="large"
                value={searchQuery}
                onChange={(e) => handleSearchChange(e.target.value)}
                className="w-full"
              />
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleBookmarkToggle}
                className={`
                  flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all duration-200
                  ${
                    showBookmarkedOnly
                      ? "bg-blue-500 text-white shadow-md"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }
                `}
              >
                {showBookmarkedOnly ? (
                  <>
                    <FaHeart className="text-red-400" />
                    <span>Bookmarked</span>
                  </>
                ) : (
                  <>
                    <FaRegBookmark />
                    <span>All Items</span>
                  </>
                )}
              </button>
            </div>

            <div className="w-full md:w-64">
              <Select
                mode="multiple"
                placeholder="Filter by Tags"
                size="large"
                value={selectedTags}
                onChange={handleTagChange}
                onSearch={setTagSearchQuery}
                showSearch
                filterOption={false}
                loading={tagLoading}
                allowClear
                maxTagCount="responsive"
                suffixIcon={<FilterOutlined />}
                className="w-full"
                options={tagOptions.map((tag) => ({
                  label: tag.name,
                  value: tag.name,
                }))}
              />
            </div>
          </div>
        </div>

        {error && (
          <Alert
            message="Error"
            description={error}
            type="error"
            showIcon
            closable
            onClose={() => setError(null)}
            className="mb-6"
          />
        )}

        {loading ? (
          <div className="flex justify-center items-center py-20">
            <Spin size="large" />
          </div>
        ) : (
          <>
            <Row gutter={[16, 16]} className="mb-6">
              {panoramas.map((panorama) => (
                <Col key={panorama._id} xs={24} sm={12} md={8} lg={6} xl={6}>
                  <Card
                    hoverable
                    className="h-full shadow-md hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
                    cover={
                      <div className="relative h-48 bg-gray-200 overflow-hidden p-0 m-0">
                        <Image
                          alt={panorama.name}
                          src={getImageUrl(panorama.filePath)}
                          className="object-cover w-full h-full"
                          style={{
                            display: "block",
                            width: "100%",
                            height: "100%",
                          }}
                          preview={false}
                          rootClassName="w-full h-full"
                        />
                        {panorama.isBookmarked ? (
                          <div className="absolute top-2 right-2">
                            <FaBookmark
                              style={{ fontSize: "24px", color: "#ef4444" }}
                            />
                          </div>
                        ) : (
                          <div className="absolute top-2 right-2">
                            <FaRegBookmark
                              style={{ fontSize: "24px", color: "#9ca3af" }}
                            />
                          </div>
                        )}
                      </div>
                    }
                  >
                    <Card.Meta
                      title={
                        <Text strong className="text-gray-800">
                          {panorama.name}
                        </Text>
                      }
                      description={
                        <Space
                          direction="vertical"
                          size="small"
                          className="w-full"
                        >
                          {panorama.tags && panorama.tags.length > 0 && (
                            <div className="flex flex-wrap gap-1">
                              {panorama.tags.map((tag, index) => (
                                <Tag
                                  key={tag._id}
                                  color={getTagColor(index)}
                                  className="m-0"
                                >
                                  {tag.name}
                                </Tag>
                              ))}
                            </div>
                          )}
                          <div className="text-xs text-gray-500 space-y-1">
                            <div>Size: {formatFileSize(panorama.fileSize)}</div>
                            <div>Created: {formatDate(panorama.createdAt)}</div>
                          </div>
                        </Space>
                      }
                    />
                  </Card>
                </Col>
              ))}
            </Row>

            {panoramas.length === 0 && !loading && (
              <div className="text-center py-12">
                <Text type="secondary" className="text-lg">
                  No panoramas found
                </Text>
              </div>
            )}
          </>
        )}

        {pagination.total > 0 && (
          <div className="bg-white rounded-lg shadow-sm p-4 mt-6 border-t border-gray-200">
            <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
              <div className="text-gray-600">
                <Text>
                  Showing {resultRange.start}-{resultRange.end} of{" "}
                  {pagination.total} results
                </Text>
              </div>

              <Pagination
                current={pagination.page}
                total={pagination.total}
                pageSize={pagination.limit}
                onChange={handlePageChange}
                showSizeChanger={false}
                showQuickJumper
                className="custom-pagination"
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PanoramaListPage;
